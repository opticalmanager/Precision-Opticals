import pg from "pg";
import fs from "fs";
import path from "path";

// Simple env file parser
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

const { Client } = pg;

// Categories definition
const CATEGORIES = [
  { slug: "sunglasses", name: "Sunglasses", description: "Polarized & UV400 Designer Sunglasses", display_order: 1 },
  { slug: "eyeglasses", name: "Eyeglasses", description: "Precision Prescription Frames & Blue-Cut Lenses", display_order: 2 },
  { slug: "meta-smart", name: "Meta Smart Glasses", description: "Next-Gen Audio, Camera & AI Smart Glasses", display_order: 3 },
  { slug: "contact-lenses", name: "Contact Lenses", description: "Silicone Hydrogel & Natural Color Contact Lenses", display_order: 4 },
  { slug: "kids", name: "Kids Eyewear", description: "Durable & Flexible Junior Frames", display_order: 5 }
];

// Brands definition
const BRANDS = [
  { slug: "cartier", name: "Cartier", origin: "Paris, France", tagline: "Precious Eyewear & Haute Horlogerie", is_featured: true },
  { slug: "maybach", name: "Maybach", origin: "Germany", tagline: "Icons of Luxury", is_featured: true },
  { slug: "gast", name: "GAST", origin: "Milan, Italy", tagline: "Independent Avant-Garde Eyewear", is_featured: true },
  { slug: "tom-ford", name: "Tom Ford", origin: "New York / Italy", tagline: "Sophisticated Modern Elegance", is_featured: true },
  { slug: "jacques-marie-mage", name: "Jacques Marie Mage", origin: "Los Angeles / Japan", tagline: "Artisanal Precision & Limited Batches", is_featured: true },
  { slug: "lindberg", name: "Lindberg", origin: "Denmark", tagline: "Visionary Screwless Titanium", is_featured: true },
  { slug: "akoni", name: "Akoni", origin: "Switzerland / Japan", tagline: "Mastery of Design & Precision Mechanics", is_featured: true },
  { slug: "ray-ban", name: "Ray-Ban", origin: "Italy", tagline: "Timeless Iconicity Since 1937", is_featured: true },
  { slug: "gucci", name: "Gucci", origin: "Florence, Italy", tagline: "Eclectic Italian Haute Couture", is_featured: true },
  { slug: "prada", name: "Prada", origin: "Milan, Italy", tagline: "Modernist Sophistication", is_featured: true },
  { slug: "persol", name: "Persol", origin: "Turin, Italy", tagline: "Handmade Italian Craftsmanship", is_featured: true },
  { slug: "oakley", name: "Oakley", origin: "California, USA", tagline: "High Definition Optics & Sports Performance", is_featured: true }
];

// Lens Packages
const LENS_PACKAGES = [
  { lens_type: "single-vision", name: "Standard Anti-Glare Single Vision", description: "Clear lenses with anti-reflective coating for distance or reading.", price: 1499.00, badge: "Popular", display_order: 1 },
  { lens_type: "single-vision", name: "Ultra-Thin 1.67 Blue-Cut Hi-Index", description: "40% thinner, 99% blue light blocking for digital screens.", price: 2999.00, badge: "Best Value", display_order: 2 },
  { lens_type: "progressive", name: "Digital Freeform Corridor Progressive", description: "Seamless distance, intermediate, and reading vision with zero distortion lines.", price: 4499.00, badge: "Recommended", display_order: 3 },
  { lens_type: "progressive", name: "Zeiss DriveSafe Precision Progressive", description: "High-contrast night driving & all-day panoramic clarity.", price: 8999.00, badge: "Luxury", display_order: 4 },
  { lens_type: "zero-power-blue", name: "Zero-Power Blue Defense", description: "Non-prescription blue-cut computer protection for software developers & gamers.", price: 1299.00, badge: "Zero Power", display_order: 5 },
  { lens_type: "frame-only", name: "Frame Only (Demo Lenses)", description: "Order frame only with demonstration plastic lenses.", price: 0.00, badge: "Frame Only", display_order: 6 }
];

// Luxury Products
const PRODUCTS = [
  {
    slug: "gast-astro-as02-53",
    brand_slug: "gast",
    name: "ASTRO AS02 53",
    subtitle: "Astro Collection in 8 Variants",
    base_price: 17900,
    original_price: 21900,
    category_slug: "sunglasses",
    gender: "unisex",
    shape: "rectangle",
    rim_type: "rimless",
    material: "titanium",
    color: "Gold / Emerald Green Tint",
    color_hex: "#D4AF37",
    lens_properties: ["polarized", "uv-protection", "anti-reflective"],
    is_new_arrival: true,
    is_best_seller: true,
    description: "Minimalist rimless silhouette with emerald green tinted nylon lenses, Japanese beta-titanium temple arms, and custom silicone nose pads with 18k gold detailing.",
    specs: { lensWidth: 53, bridgeWidth: 18, templeLength: 145, frameWidth: 138, weight: "16g" },
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Gold / Emerald Green", color_hex: "#D4AF37", sku: "GAST-AST-01", stock: 12 },
      { color_name: "Silver / Glacier Blue", color_hex: "#C0C0C0", sku: "GAST-AST-02", stock: 8 },
      { color_name: "Rose Gold / Sunset Rose", color_hex: "#B76E79", sku: "GAST-AST-03", stock: 6 },
      { color_name: "Matte Gunmetal / Smoke", color_hex: "#4A4A4A", sku: "GAST-AST-04", stock: 15 }
    ]
  },
  {
    slug: "gast-pai-pa04-48",
    brand_slug: "gast",
    name: "PAI PA04 48",
    subtitle: "Pai Collection in 8 Colorways",
    base_price: 15400,
    original_price: 17500,
    category_slug: "sunglasses",
    gender: "unisex",
    shape: "square",
    rim_type: "full-rim",
    material: "acetate",
    color: "Havana Tortoise / Warm Amber",
    color_hex: "#8B4513",
    lens_properties: ["uv-protection", "anti-reflective"],
    is_new_arrival: true,
    is_best_seller: false,
    description: "Chunky architectural Italian Mazzucchelli acetate frame with bevelled edges and 5-barrel German OBE hinges.",
    specs: { lensWidth: 48, bridgeWidth: 22, templeLength: 145, frameWidth: 140, weight: "34g" },
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Havana Tortoise", color_hex: "#8B4513", sku: "GAST-PAI-01", stock: 10 },
      { color_name: "Onyx Black", color_hex: "#111111", sku: "GAST-PAI-02", stock: 14 }
    ]
  },
  {
    slug: "tom-ford-dax-0751-01v",
    brand_slug: "tom-ford",
    name: "DAX 0751 01V 50",
    subtitle: "Signature T-Logo Luxury Series",
    base_price: 34500,
    original_price: 38000,
    category_slug: "sunglasses",
    gender: "men",
    shape: "square",
    rim_type: "full-rim",
    material: "acetate",
    color: "Glossy Black / Cobalt Blue Lenses",
    color_hex: "#0A0A0A",
    lens_properties: ["polarized", "uv-protection"],
    is_new_arrival: false,
    is_best_seller: true,
    description: "Iconic Tom Ford bold silhouette featuring signature gold metal T temple inlays and 100% UV crystal blue mineral glass lenses.",
    specs: { lensWidth: 50, bridgeWidth: 21, templeLength: 145, frameWidth: 142, weight: "38g" },
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Glossy Black / Blue", color_hex: "#0A0A0A", sku: "TF-DAX-01", stock: 7 },
      { color_name: "Dark Havana / Brown", color_hex: "#3E2723", sku: "TF-DAX-02", stock: 5 }
    ]
  },
  {
    slug: "ray-ban-meta-wayfarer-gen2",
    brand_slug: "ray-ban",
    name: "Ray-Ban | Meta Wayfarer Smart Glasses",
    subtitle: "Next-Gen Audio, Ultra-Wide 12MP Camera & Meta AI",
    base_price: 29900,
    original_price: 32900,
    category_slug: "meta-smart",
    gender: "unisex",
    shape: "wayfarer",
    rim_type: "full-rim",
    material: "acetate",
    color: "Matte Black / Transitions Clear to Graphite Green",
    color_hex: "#1A1A1A",
    lens_properties: ["photochromic", "uv-protection", "anti-reflective"],
    is_new_arrival: true,
    is_best_seller: true,
    description: "Equipped with discrete open-ear speakers, 5-mic array for crystal clear calls, touch touchpad, and voice-controlled Meta AI assistant.",
    specs: { lensWidth: 50, bridgeWidth: 22, templeLength: 150, frameWidth: 144, weight: "49g" },
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Matte Black / Transitions", color_hex: "#1A1A1A", sku: "RBM-WAY-01", stock: 20 },
      { color_name: "Shiny Black / Polarized G15", color_hex: "#050505", sku: "RBM-WAY-02", stock: 15 },
      { color_name: "Caramel Transparent", color_hex: "#D2A679", sku: "RBM-WAY-03", stock: 10 }
    ]
  },
  {
    slug: "cartier-premiere-ct0012o",
    brand_slug: "cartier",
    name: "Cartier Première CT0012O 001",
    subtitle: "18K Gold Plated Rimless Titanium Optics",
    base_price: 78500,
    original_price: 85000,
    category_slug: "eyeglasses",
    gender: "unisex",
    shape: "rectangle",
    rim_type: "rimless",
    material: "18k-gold-plated",
    color: "Polished Yellow Gold",
    color_hex: "#E5C158",
    lens_properties: ["anti-reflective", "blue-light-filter"],
    is_new_arrival: false,
    is_best_seller: true,
    description: "Timeless Cartier rimless architecture featuring iconic double C de Cartier motifs on temples, hand-polished 18k gold electroplating, and bespoke spring flex hinges.",
    specs: { lensWidth: 53, bridgeWidth: 19, templeLength: 140, frameWidth: 136, weight: "14g" },
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Yellow Gold", color_hex: "#E5C158", sku: "CART-PREM-01", stock: 4 },
      { color_name: "Platinum White Gold", color_hex: "#E5E4E2", sku: "CART-PREM-02", stock: 3 }
    ]
  },
  {
    slug: "lindberg-air-titanium-rim-morten",
    brand_slug: "lindberg",
    name: "Lindberg Air Titanium Rim Morten",
    subtitle: "Danish Screwless Titanium Architecture (2.7 Grams)",
    base_price: 52000,
    original_price: 58000,
    category_slug: "eyeglasses",
    gender: "unisex",
    shape: "round",
    rim_type: "full-rim",
    material: "titanium",
    color: "Brushed Graphite Titanium",
    color_hex: "#383838",
    lens_properties: ["anti-reflective"],
    is_new_arrival: false,
    is_best_seller: true,
    description: "Weighing a mere 2.7 grams, the iconic Morten frame by Lindberg is handcrafted from medical-grade Danish titanium wire without screws or welds for supreme weightlessness.",
    specs: { lensWidth: 50, bridgeWidth: 20, templeLength: 145, frameWidth: 135, weight: "2.7g" },
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { color_name: "Brushed Graphite", color_hex: "#383838", sku: "LIND-MOR-01", stock: 6 },
      { color_name: "Polished Titanium Silver", color_hex: "#C0C0C0", sku: "LIND-MOR-02", stock: 8 },
      { color_name: "Deep Midnight Blue", color_hex: "#1B263B", sku: "LIND-MOR-03", stock: 5 }
    ]
  }
];

async function seedDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase. Starting catalog seed...");

    // 1. Seed Categories
    console.log("Seeding Categories...");
    const categoryMap = new Map();
    for (const cat of CATEGORIES) {
      const res = await client.query(
        `INSERT INTO public.categories (slug, name, description, display_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order
         RETURNING id, slug;`,
        [cat.slug, cat.name, cat.description, cat.display_order]
      );
      categoryMap.set(res.rows[0].slug, res.rows[0].id);
    }
    console.log(`Inserted ${categoryMap.size} categories.`);

    // 2. Seed Brands
    console.log("Seeding Brands...");
    const brandMap = new Map();
    for (const b of BRANDS) {
      const res = await client.query(
        `INSERT INTO public.brands (slug, name, origin, tagline, is_featured)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, origin = EXCLUDED.origin, tagline = EXCLUDED.tagline, is_featured = EXCLUDED.is_featured
         RETURNING id, slug;`,
        [b.slug, b.name, b.origin, b.tagline, b.is_featured]
      );
      brandMap.set(res.rows[0].slug, res.rows[0].id);
    }
    console.log(`Inserted ${brandMap.size} brands.`);

    // 3. Seed Lens Packages
    console.log("Seeding Lens Packages...");
    for (const lp of LENS_PACKAGES) {
      await client.query(
        `INSERT INTO public.lens_packages (lens_type, name, description, price, badge, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING;`,
        [lp.lens_type, lp.name, lp.description, lp.price, lp.badge, lp.display_order]
      );
    }
    console.log(`Inserted lens customization packages.`);

    // 4. Seed Products, Variants & Images
    console.log("Seeding Products, Variants & Images...");
    for (const p of PRODUCTS) {
      const brandId = brandMap.get(p.brand_slug);
      const categoryId = categoryMap.get(p.category_slug);

      const prodRes = await client.query(
        `INSERT INTO public.products (
           slug, name, subtitle, brand_id, category_id, gender, shape, rim_type,
           material, color, color_hex, base_price, original_price, lens_properties,
           specs, description, is_new_arrival, is_best_seller
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, base_price = EXCLUDED.base_price
         RETURNING id;`,
        [
          p.slug, p.name, p.subtitle, brandId, categoryId, p.gender, p.shape, p.rim_type,
          p.material, p.color, p.color_hex, p.base_price, p.original_price, p.lens_properties,
          JSON.stringify(p.specs), p.description, p.is_new_arrival, p.is_best_seller
        ]
      );

      const productId = prodRes.rows[0].id;

      // Seed Variants
      for (const v of p.variants) {
        await client.query(
          `INSERT INTO public.product_variants (product_id, color_name, color_hex, sku, stock_quantity)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (sku) DO UPDATE
           SET stock_quantity = EXCLUDED.stock_quantity;`,
          [productId, v.color_name, v.color_hex, v.sku, v.stock]
        );
      }

      // Seed Images
      for (let i = 0; i < p.images.length; i++) {
        await client.query(
          `INSERT INTO public.product_images (product_id, url, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5);`,
          [productId, p.images[i], `${p.name} photo ${i + 1}`, i, i === 0]
        );
      }
    }
    console.log(`Seeded ${PRODUCTS.length} luxury products with variants and images.`);

    // 5. Seed Welcome Coupons
    console.log("Seeding Welcome Coupons...");
    await client.query(
      `INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount, valid_until)
       VALUES 
         ('PRECISION10', 'percentage', 10.00, 5000.00, 3000.00, NOW() + INTERVAL '1 year'),
         ('LUXURY2026', 'fixed', 2000.00, 15000.00, NULL, NOW() + INTERVAL '1 year')
       ON CONFLICT (code) DO NOTHING;`
    );

    console.log("All catalog seed operations completed successfully!");

  } catch (e) {
    console.error("Seed error:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
