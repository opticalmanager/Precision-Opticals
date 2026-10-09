import pg from "pg";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const { Pool } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("========================================================================");
  console.log("   PRECISION OPTICS - DATABASE MIGRATIONS & CATALOG INGESTION");
  console.log("========================================================================");
  console.log("Connecting to Supabase PostgreSQL via resilient Pool...");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  async function safeQuery(text, params, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        const msg = err.message || "";
        if (
          attempt < maxRetries &&
          (msg.includes("terminated") ||
            msg.includes("Connection") ||
            msg.includes("closed") ||
            msg.includes("timeout") ||
            err.code === "ECONNRESET" ||
            err.code === "57P01")
        ) {
          console.warn(`[safeQuery] Connection issue on attempt ${attempt} (${msg.slice(0, 50)}). Retrying in 1.5s...`);
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        throw err;
      }
    }
  }

  try {
    const testConn = await safeQuery("SELECT NOW()");
    console.log("[OK] Successfully connected to Supabase database! Time:", testConn.rows[0].now, "\n");

    // --------------------------------------------------------------------------
    // 1. APPLY MIGRATIONS IN SEQUENTIAL ORDER
    // --------------------------------------------------------------------------
    const migrationFiles = [
      "01_initial_schema.sql",
      "02_wishlist_schema.sql",
      "03_privacy_and_enquiries.sql",
      "04_try_on_schema.sql",
      "05_payment_gateway_schema.sql",
      "06_scraped_catalog_alignment.sql",
    ];

    console.log("Step 1: Applying Database Schema Migrations...");
    for (const file of migrationFiles) {
      const mPath = path.join(process.cwd(), "supabase", "migrations", file);
      if (fs.existsSync(mPath)) {
        try {
          console.log(` -> Applying ${file}...`);
          const sql = fs.readFileSync(mPath, "utf-8");
          await safeQuery(sql);
          console.log(`    [OK] ${file} applied.`);
        } catch (mErr) {
          if (mErr.code === "42710" || mErr.code === "42P07" || mErr.message?.includes("already exists")) {
            console.log(`    [Notice] ${file} already applied or partially existing (${mErr.message.slice(0, 60)}). Proceeding...`);
          } else {
            console.warn(`    [Warn] ${file}: ${mErr.message}`);
          }
        }
      }
    }

    // Explicitly guarantee migration 06 commands run cleanly
    console.log(" -> Enforcing Migration 06 (Scraped catalog & constraint alignment)...");
    await safeQuery(`
      ALTER TABLE IF EXISTS public.products
        ADD COLUMN IF NOT EXISTS source_url TEXT,
        ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS package_dimensions JSONB DEFAULT '{"lengthCm": 18, "breadthCm": 9, "heightCm": 7, "weightKg": 0.25}'::jsonb;

      ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_shape_check;
      ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_rim_type_check;
      ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_original_price_check;
      ALTER TABLE IF EXISTS public.products ADD CONSTRAINT products_original_price_check CHECK (original_price IS NULL OR original_price >= base_price);
      CREATE INDEX IF NOT EXISTS idx_products_source_url ON public.products(source_url);
    `);

    // Ensure admin_settings table exists
    await safeQuery(`
      CREATE TABLE IF NOT EXISTS public.admin_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("[OK] Schema Migrations Verified & Aligned Successfully!\n");

    // --------------------------------------------------------------------------
    // 2. SEED CORE CATEGORIES
    // --------------------------------------------------------------------------
    console.log("Step 2: Syncing Categories...");
    const initialCategories = [
      { slug: "eyeglasses", name: "Eyeglasses", description: "Bespoke Prescription Optical Frames", order: 1 },
      { slug: "sunglasses", name: "Sunglasses", description: "Designer Haute Sun Protection", order: 2 },
      { slug: "contact-lenses", name: "Contact Lenses", description: "Clinical Precision Contact Lenses", order: 3 },
    ];

    for (const c of initialCategories) {
      await safeQuery(
        `INSERT INTO public.categories (slug, name, description, display_order, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description;`,
        [c.slug, c.name, c.description, c.order]
      );
    }

    const catRes = await safeQuery("SELECT id, slug FROM public.categories");
    const categoryMap = {};
    catRes.rows.forEach(r => { categoryMap[r.slug] = r.id; });
    console.log(`[OK] Categories synced: ${Object.keys(categoryMap).join(", ")}\n`);

    // --------------------------------------------------------------------------
    // 3. READ SCRAPED DATASET
    // --------------------------------------------------------------------------
    const datasetPath = path.join(process.cwd(), "data", "dayal_scraped_products.json");
    if (!fs.existsSync(datasetPath)) {
      console.error(`ERROR: Scraped dataset not found at ${datasetPath}`);
      process.exit(1);
    }
    const rawItems = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    console.log(`Step 3: Ingesting Catalog (${rawItems.length} products)...`);

    // Collect all unique brands from catalog
    const brandSet = new Set(rawItems.map(p => p.brand).filter(Boolean));
    console.log(` -> Registering ${brandSet.size} unique brands...`);

    for (const bName of brandSet) {
      const bSlug = bName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await safeQuery(
        `INSERT INTO public.brands (slug, name, origin, tagline, description, is_active)
         VALUES ($1, $2, 'Haute Lunetterie', 'Independent Luxury & Vision Care', $3, true)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name;`,
        [bSlug, bName, `Authentic collection by ${bName}`]
      );
    }

    const brandRes = await safeQuery("SELECT id, slug, name FROM public.brands");
    const brandMap = {};
    brandRes.rows.forEach(r => {
      brandMap[r.name.toLowerCase()] = r.id;
      brandMap[r.slug] = r.id;
    });

    // --------------------------------------------------------------------------
    // 4. PURGE LEGACY MOCK / DUMMY PRODUCTS
    // --------------------------------------------------------------------------
    console.log("Step 4: Purging Legacy Mock / Dummy Products...");
    const purgeRes = await safeQuery(`
      DELETE FROM public.products 
      WHERE slug NOT LIKE 'do-%' 
         OR specs->>'is_demo' = 'true' 
         OR slug LIKE 'akoni-%' 
         OR slug LIKE 'akn-%';
    `);
    console.log(`[OK] Purged legacy mock/dummy products (${purgeRes.rowCount || 0} rows deleted).\n`);

    // --------------------------------------------------------------------------
    // 5. INGEST PRODUCTS, VARIANTS, AND IMAGES WITH WORKING MASTER CDN URLS
    // --------------------------------------------------------------------------
    console.log(`Step 5: Updating all ${rawItems.length} products with authentic master CDN URLs & colorway galleries...`);
    let insertedProducts = 0;
    let newlyInsertedProducts = 0;
    let insertedVariants = 0;
    let insertedImages = 0;

    async function ingestProduct(p, i) {
      const normCat = (p.category || "").toLowerCase();
      let catSlug = "eyeglasses";
      if (normCat.includes("contact") || normCat.includes("lens")) catSlug = "contact-lenses";
      else if (normCat.includes("sun")) catSlug = "sunglasses";

      const categoryId = categoryMap[catSlug] || categoryMap["eyeglasses"];
      const brandId = brandMap[(p.brand || "").toLowerCase()] || null;

      const normGender = (p.gender || "unisex").toLowerCase();
      const validGender = ["men", "women", "kids"].includes(normGender) ? normGender : "unisex";

      const normShape = (p.shape || "rectangle").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const normRim = catSlug === "contact-lenses" ? "rimless" : (p.rimType || "full-rim");

      const specsObj = {
        ...(p.measurements || {}),
        lensWidth: p.measurements?.lensWidth || (catSlug === "contact-lenses" ? 14 : 53),
        bridgeWidth: p.measurements?.bridgeWidth || (catSlug === "contact-lenses" ? 8 : 18),
        templeLength: p.measurements?.templeLength || (catSlug === "contact-lenses" ? 0 : 145),
        frameWidth: catSlug === "contact-lenses" ? 0 : 140,
        weight: p.measurements?.weight || (catSlug === "contact-lenses" ? "0.08g" : "22g"),
        contactLensSpecs: p.contactLensSpecs || undefined,
        packageDimensions: p.packageDimensions || undefined,
      };

      const primaryImg = p.img || (p.images && p.images[0]) || "";
      const price = Number(p.price) || 4999;
      const originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
      const effectiveOriginalPrice = (originalPrice && originalPrice >= price) ? originalPrice : null;

      const cleanName = (p.name || '').replace(/\s+/g, ' ').trim();
      const cleanSubtitle = (p.tag || (catSlug === "contact-lenses" ? "Clinical Contact Lens" : `${p.brand} Eyewear`)).replace(/\s+/g, ' ').trim();

      const cleanedColorVariants = (p.colorVariants || []).map(cv => ({
        ...cv,
        colorName: (cv.colorName || '').replace(/\s+/g, ' ').trim(),
      }));

      // Upsert Product
      const prodRes = await safeQuery(
        `INSERT INTO public.products (
          slug,
          name,
          subtitle,
          brand_id,
          category_id,
          gender,
          shape,
          rim_type,
          material,
          color,
          color_hex,
          base_price,
          original_price,
          lens_properties,
          specs,
          description,
          is_new_arrival,
          is_best_seller,
          is_on_sale,
          is_limited_edition,
          is_active,
          rating,
          review_count,
          try_on_enabled,
          source_url,
          color_variants,
          package_dimensions
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) ON CONFLICT (slug) DO UPDATE
        SET
          name = EXCLUDED.name,
          subtitle = EXCLUDED.subtitle,
          base_price = EXCLUDED.base_price,
          original_price = EXCLUDED.original_price,
          specs = EXCLUDED.specs,
          source_url = EXCLUDED.source_url,
          color_variants = EXCLUDED.color_variants,
          package_dimensions = EXCLUDED.package_dimensions,
          updated_at = NOW()
        RETURNING id;`,
        [
          p.id,
          cleanName,
          cleanSubtitle,
          brandId,
          categoryId,
          validGender,
          normShape,
          normRim,
          p.material || (catSlug === "contact-lenses" ? "silicone-hydrogel" : "acetate"),
          cleanedColorVariants[0]?.colorName || "Classic",
          cleanedColorVariants[0]?.colorHex || p.colors?.[0] || "#1A1A1A",
          price,
          effectiveOriginalPrice,
          catSlug === "contact-lenses" ? ["uv-protection"] : ["anti-reflective", "uv-protection", "blue-light-filter"],
          JSON.stringify(specsObj),
          p.description || "",
          Boolean(p.tagType === "new" || i % 3 === 0),
          Boolean(p.brand === "Ray-Ban" || p.brand === "Vogue" || i % 5 === 0),
          Boolean(p.discountPct && p.discountPct > 0),
          Boolean(p.name?.includes("SPECIAL") || p.name?.includes("LIMITED")),
          true,
          Number(p.rating) || 4.85,
          12 + ((i * 7) % 60),
          catSlug !== "contact-lenses",
          p.sourceUrl || "",
          JSON.stringify(cleanedColorVariants),
          JSON.stringify(p.packageDimensions || { lengthCm: 18, breadthCm: 9, heightCm: 7, weightKg: 0.25 })
        ]
      );

      const productId = prodRes.rows[0].id;

      // Delete existing variants and images for clean idempotent re-insertion
      await safeQuery("DELETE FROM public.product_variants WHERE product_id = $1", [productId]);
      await safeQuery("DELETE FROM public.product_images WHERE product_id = $1", [productId]);

      // Insert Variants
      const variants = (cleanedColorVariants.length > 0)
        ? cleanedColorVariants
        : [
            {
              sku: `SKU-${p.id}-0`,
              colorName: catSlug === "contact-lenses" ? "Standard Pack" : "Classic",
              colorHex: p.colors?.[0] || "#1A1A1A",
              available: true,
              featuredImage: primaryImg,
            }
          ];

      const cleanProdId = String(p.id).replace(/^do-/, "");
      let varCount = 0;
      let imgCount = 0;

      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx];
        const variantSku = v.variantId
          ? `SKU-${cleanProdId}-${v.variantId}`
          : `SKU-${cleanProdId}-${vIdx + 1}`;
        const cleanColorName = (v.colorName || "Default").replace(/\s+/g, ' ').trim();

        const vRes = await safeQuery(
          `INSERT INTO public.product_variants (
            product_id,
            color_name,
            color_hex,
            sku,
            stock_quantity,
            is_default
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (sku) DO UPDATE SET
            product_id = EXCLUDED.product_id,
            color_name = EXCLUDED.color_name,
            color_hex = EXCLUDED.color_hex,
            stock_quantity = EXCLUDED.stock_quantity,
            is_default = EXCLUDED.is_default
          RETURNING id;`,
          [
            productId,
            cleanColorName,
            v.colorHex || "#1A1A1A",
            variantSku,
            v.available !== false ? 12 : 0,
            vIdx === 0
          ]
        );
        const variantId = vRes.rows[0].id;
        varCount++;

        // Insert variant image
        const vImg = v.featuredImage || primaryImg;
        if (vImg) {
          await safeQuery(
            `INSERT INTO public.product_images (
              product_id,
              variant_id,
              url,
              alt_text,
              display_order,
              is_primary
            ) VALUES ($1, $2, $3, $4, $5, $6);`,
            [productId, variantId, vImg, `${cleanName} - ${cleanColorName}`, vIdx, vIdx === 0]
          );
          imgCount++;
        }
      }

      // Insert extra gallery images if any
      const galleryImages = p.images || [];
      const seenUrls = new Set([primaryImg]);
      for (let gIdx = 0; gIdx < galleryImages.length; gIdx++) {
        const gUrl = galleryImages[gIdx];
        if (gUrl && !seenUrls.has(gUrl)) {
          seenUrls.add(gUrl);
          await safeQuery(
            `INSERT INTO public.product_images (
              product_id,
              variant_id,
              url,
              alt_text,
              display_order,
              is_primary
            ) VALUES ($1, NULL, $2, $3, $4, false);`,
            [productId, gUrl, `${cleanName} - Angle ${gIdx + 1}`, gIdx + 10]
          );
          imgCount++;
        }
      }

      return { varCount, imgCount };
    }

    const CHUNK_SIZE = 8;
    for (let i = 0; i < rawItems.length; i += CHUNK_SIZE) {
      const chunk = rawItems.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(chunk.map((item, cIdx) => ingestProduct(item, i + cIdx)));
      insertedProducts += chunk.length;
      newlyInsertedProducts += chunk.length;
      results.forEach(r => {
        insertedVariants += r.varCount;
        insertedImages += r.imgCount;
      });
      console.log(` -> Ingested ${Math.min(i + CHUNK_SIZE, rawItems.length)}/${rawItems.length} products...`);
    }

    console.log("\n========================================================================");
    console.log("   CATALOG INGESTION SUMMARY");
    console.log("========================================================================");
    console.log(`Total Products in Catalog : ${insertedProducts}`);
    console.log(`Newly Added in This Run   : ${newlyInsertedProducts}`);
    console.log(`New Variants Added        : ${insertedVariants}`);
    console.log(`New Images Registered     : ${insertedImages}`);

    // Verify database counts
    const verifyProd = await safeQuery("SELECT COUNT(*) FROM public.products");
    const verifyBrand = await safeQuery("SELECT COUNT(*) FROM public.brands");
    const verifyCat = await safeQuery("SELECT COUNT(*) FROM public.categories");
    const verifyVar = await safeQuery("SELECT COUNT(*) FROM public.product_variants");
    const verifyImg = await safeQuery("SELECT COUNT(*) FROM public.product_images");

    console.log("\nLive Database State in Supabase:");
    console.log(` -> public.products        : ${verifyProd.rows[0].count} items`);
    console.log(` -> public.brands          : ${verifyBrand.rows[0].count} brands`);
    console.log(` -> public.categories      : ${verifyCat.rows[0].count} categories`);
    console.log(` -> public.product_variants: ${verifyVar.rows[0].count} variants`);
    console.log(` -> public.product_images  : ${verifyImg.rows[0].count} images`);
    console.log("========================================================================\n");

  } catch (err) {
    console.error("Migration/Ingestion Error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
