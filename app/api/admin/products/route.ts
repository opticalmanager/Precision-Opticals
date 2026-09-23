import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const statusTab = searchParams.get("tab") || "all"; // all, published, draft, out_of_stock, archived
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    // Search filter
    if (search) {
      conditions.push(`(p.name ILIKE $${pIdx} OR p.slug ILIKE $${pIdx} OR b.name ILIKE $${pIdx} OR EXISTS (
        SELECT 1 FROM public.product_variants pv_s WHERE pv_s.product_id = p.id AND pv_s.sku ILIKE $${pIdx}
      ))`);
      params.push(`%${search}%`);
      pIdx++;
    }

    // Category filter
    if (category && category !== "all") {
      conditions.push(`c.slug = $${pIdx}`);
      params.push(category);
      pIdx++;
    }

    // Brand filter
    if (brand && brand !== "all") {
      conditions.push(`b.slug = $${pIdx}`);
      params.push(brand);
      pIdx++;
    }

    // Status Tab filter
    if (statusTab === "published") {
      conditions.push(`p.is_active = true`);
    } else if (statusTab === "draft") {
      conditions.push(`p.is_active = false`);
    } else if (statusTab === "out_of_stock") {
      conditions.push(`COALESCE((SELECT SUM(stock_quantity) FROM public.product_variants WHERE product_id = p.id), 0) = 0`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total count for current filter
    const countRes = await query(
      `SELECT COUNT(DISTINCT p.id) as total
       FROM public.products p
       LEFT JOIN public.brands b ON b.id = p.brand_id
       LEFT JOIN public.categories c ON c.id = p.category_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.total || "0", 10);

    // Global tab counts for quick navigation
    const tabCountsRes = await query(`
      SELECT 
        COUNT(id) as total_all,
        COUNT(CASE WHEN is_active = true THEN 1 END) as total_published,
        COUNT(CASE WHEN is_active = false THEN 1 END) as total_draft,
        COUNT(CASE WHEN COALESCE((SELECT SUM(stock_quantity) FROM public.product_variants WHERE product_id = p.id), 0) = 0 THEN 1 END) as total_out_of_stock
      FROM public.products p;
    `);
    const tabCounts = tabCountsRes.rows[0] || { total_all: 0, total_published: 0, total_draft: 0, total_out_of_stock: 0 };

    // Fetch paginated products with variants and primary image
    const productsRes = await query(
      `SELECT 
        p.id,
        p.slug,
        p.name,
        p.subtitle,
        p.gender,
        p.shape,
        p.rim_type,
        p.material,
        p.color,
        p.color_hex,
        p.base_price,
        p.original_price,
        p.is_active,
        p.is_new_arrival,
        p.is_best_seller,
        p.is_on_sale,
        p.try_on_enabled,
        p.try_on_model_url,
        p.try_on_configuration,
        p.created_at,
        p.updated_at,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'url', pi.url,
            'is_primary', pi.is_primary,
            'display_order', pi.display_order
          ) ORDER BY pi.is_primary DESC, pi.display_order ASC)
          FROM public.product_images pi
          WHERE pi.product_id = p.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', pv.id,
            'sku', pv.sku,
            'color_name', pv.color_name,
            'color_hex', pv.color_hex,
            'stock_quantity', pv.stock_quantity
          ) ORDER BY pv.created_at ASC)
          FROM public.product_variants pv
          WHERE pv.product_id = p.id
        ), '[]'::json) as variants,
        COALESCE((
          SELECT SUM(stock_quantity) FROM public.product_variants WHERE product_id = p.id
        ), 10) as total_stock
      FROM public.products p
      LEFT JOIN public.brands b ON b.id = p.brand_id
      LEFT JOIN public.categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1};`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      products: productsRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: parseInt(tabCounts.total_all || "0", 10),
        published: parseInt(tabCounts.total_published || "0", 10),
        draft: parseInt(tabCounts.total_draft || "0", 10),
        outOfStock: parseInt(tabCounts.total_out_of_stock || "0", 10),
      },
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const basePrice = Number(body.basePrice || body.base_price || 0);
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : null;
    const gender = body.gender || "unisex";
    const shape = body.shape || "rectangle";
    const rimType = body.rimType || body.rim_type || "rimless";
    const material = body.material || "titanium";
    const color = body.color || "Gold";
    const colorHex = body.colorHex || body.color_hex || "#D4AF37";
    const subtitle = body.subtitle || "";
    const description = body.description || "";
    const lensProperties = Array.isArray(body.lensProperties) ? body.lensProperties : ["uv-protection", "anti-reflective"];
    const specs = body.specs || { lensWidth: 53, bridgeWidth: 18, templeLength: 145, frameWidth: 140, weight: "20g" };
    const isActive = body.isActive !== undefined ? body.isActive : true;

    // Find brand & category IDs
    let brandId = body.brandId || null;
    if (!brandId && body.brand) {
      const bRes = await query("SELECT id FROM public.brands WHERE slug = $1 OR name ILIKE $2 LIMIT 1", [body.brand, body.brand]);
      brandId = bRes.rows[0]?.id || null;
    }

    let categoryId = body.categoryId || null;
    if (!categoryId && body.category) {
      const cRes = await query("SELECT id FROM public.categories WHERE slug = $1 OR name ILIKE $2 LIMIT 1", [body.category, body.category]);
      categoryId = cRes.rows[0]?.id || null;
    }

    const tryOnEnabled = body.tryOnEnabled !== undefined ? Boolean(body.tryOnEnabled) : false;
    const tryOnModelUrl = body.tryOnModelUrl || null;
    const tryOnConfiguration = body.tryOnConfiguration ? (typeof body.tryOnConfiguration === "string" ? body.tryOnConfiguration : JSON.stringify(body.tryOnConfiguration)) : null;

    // Insert product
    const insertProd = await query(
      `INSERT INTO public.products (
        slug, name, subtitle, brand_id, category_id, gender, shape, rim_type,
        material, color, color_hex, base_price, original_price, lens_properties,
        specs, description, is_active, is_new_arrival, is_best_seller,
        try_on_enabled, try_on_model_url, try_on_configuration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          base_price = EXCLUDED.base_price,
          original_price = EXCLUDED.original_price,
          subtitle = EXCLUDED.subtitle,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          is_new_arrival = EXCLUDED.is_new_arrival,
          is_best_seller = EXCLUDED.is_best_seller,
          try_on_enabled = EXCLUDED.try_on_enabled,
          try_on_model_url = EXCLUDED.try_on_model_url,
          updated_at = NOW()
      RETURNING id, slug, name;`,
      [
        slug, name, subtitle, brandId, categoryId, gender, shape, rimType,
        material, color, colorHex, basePrice, originalPrice, lensProperties,
        JSON.stringify(specs), description, isActive, Boolean(body.isNewArrival), Boolean(body.isBestSeller),
        tryOnEnabled, tryOnModelUrl, tryOnConfiguration
      ]
    );

    const productId = insertProd.rows[0].id;

    // Insert Variants
    const variants = Array.isArray(body.variants) && body.variants.length > 0
      ? body.variants
      : [{ colorName: color, colorHex, sku: `SKU-${slug.slice(0, 8).toUpperCase()}-01`, stock: Number(body.stock || 15) }];

    for (const v of variants) {
      const sku = v.sku || `SKU-${slug.slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      await query(
        `INSERT INTO public.product_variants (product_id, color_name, color_hex, sku, stock_quantity)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;`,
        [productId, v.colorName || v.color_name || color, v.colorHex || v.color_hex || colorHex, sku, Number(v.stock || v.stock_quantity || 10)]
      );
    }

    // Insert Images
    if (Array.isArray(body.images) && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        const url = typeof body.images[i] === "string" ? body.images[i] : body.images[i].url;
        if (url) {
          await query(
            `INSERT INTO public.product_images (product_id, url, alt_text, display_order, is_primary)
             VALUES ($1, $2, $3, $4, $5);`,
            [productId, url, `${name} angle ${i + 1}`, i, i === 0]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      productId,
      slug,
      message: "Product created successfully in catalog",
    });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
