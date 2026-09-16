import { NextRequest, NextResponse } from "next/server";
import { query, pool } from "@/lib/adminDb";
import { AKONI_DEMO_PRODUCTS } from "@/data/akoniDemoDataset";
import { invalidateProductsCache } from "@/lib/productsService";

export async function GET() {
  try {
    const countRes = await query(
      `SELECT 
        COUNT(DISTINCT p.id) as demo_count,
        COUNT(pv.id) as demo_skus,
        COALESCE(SUM(pv.stock_quantity), 0) as demo_units
      FROM public.products p
      LEFT JOIN public.product_variants pv ON pv.product_id = p.id
      WHERE p.specs->>'is_demo' = 'true'`
    );

    const sampleRes = await query(
      `SELECT 
        p.id,
        p.slug,
        p.name,
        p.base_price,
        p.gender,
        p.shape,
        p.rim_type,
        p.material,
        pv.sku,
        pv.stock_quantity,
        COALESCE((
          SELECT url FROM public.product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.display_order ASC 
          LIMIT 1
        ), '/images/placeholder.jpg') as image_url
      FROM public.products p
      LEFT JOIN public.product_variants pv ON pv.product_id = p.id
      WHERE p.specs->>'is_demo' = 'true'
      ORDER BY p.name ASC
      LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      count: parseInt(countRes.rows[0]?.demo_count || "0", 10),
      stats: {
        totalProducts: parseInt(countRes.rows[0]?.demo_count || "0", 10),
        totalSkus: parseInt(countRes.rows[0]?.demo_skus || "0", 10),
        totalUnits: parseInt(countRes.rows[0]?.demo_units || "0", 10),
      },
      items: sampleRes.rows,
    });
  } catch (error: any) {
    console.error("GET /api/admin/demo-products error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch demo products status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Fetch or create brand 'akoni'
    let brandRes = await client.query(
      "SELECT id FROM public.brands WHERE slug = 'akoni' LIMIT 1"
    );
    let brandId: string;
    if (brandRes.rows.length === 0) {
      const newBrand = await client.query(
        `INSERT INTO public.brands (name, slug, origin, description, tagline, is_active, display_order)
         VALUES ('Akoni', 'akoni', 'Switzerland / Japan', 'Swiss design perfection combined with Japanese artisan metalsmithing.', 'Mastery of Design & Precision Mechanics', true, 6)
         RETURNING id`
      );
      brandId = newBrand.rows[0].id;
    } else {
      brandId = brandRes.rows[0].id;
    }

    // 2. Fetch categories map
    const catRes = await client.query("SELECT id, slug FROM public.categories");
    const catMap: Record<string, string> = {};
    catRes.rows.forEach((r: { id: string; slug: string }) => {
      catMap[r.slug] = r.id;
    });

    const defaultSunglassesId = catMap["sunglasses"] || catRes.rows[0]?.id;
    const defaultEyeglassesId = catMap["eyeglasses"] || catRes.rows[0]?.id;

    // 3. Clear any existing demo products before re-seeding
    await client.query("DELETE FROM public.products WHERE specs->>'is_demo' = 'true'");

    let insertedCount = 0;

    for (const item of AKONI_DEMO_PRODUCTS) {
      const categoryId = item.categorySlug === "eyeglasses" ? defaultEyeglassesId : defaultSunglassesId;

      // Insert product
      const prodRes = await client.query(
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
          try_on_enabled
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING id`,
        [
          item.slug,
          item.title,
          "Swiss Precision Eyewear",
          brandId,
          categoryId,
          item.gender,
          item.shape,
          item.rimType,
          item.material,
          item.color,
          item.colorHex,
          item.price,
          item.originalPrice,
          ["anti-reflective", "uv-protection", "scratch-resistant"],
          JSON.stringify(item.specs),
          item.description,
          true,
          false,
          false,
          false,
          true,
          4.9,
          18,
          false,
        ]
      );

      const productId = prodRes.rows[0].id;

      // Insert default variant
      const variantRes = await client.query(
        `INSERT INTO public.product_variants (
          product_id,
          color_name,
          color_hex,
          sku,
          stock_quantity,
          is_default
        ) VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id`,
        [
          productId,
          item.color,
          item.colorHex,
          item.sku,
          item.stockQuantity,
        ]
      );

      const variantId = variantRes.rows[0].id;

      // Insert all available images for this product (full multi-angle gallery)
      const imagesToInsert = item.images;
      for (let i = 0; i < imagesToInsert.length; i++) {
        const imgUrl = imagesToInsert[i];
        if (!imgUrl) continue;
        await client.query(
          `INSERT INTO public.product_images (
            product_id,
            variant_id,
            url,
            alt_text,
            display_order,
            is_primary
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            productId,
            variantId,
            imgUrl,
            `${item.title} - View ${i + 1}`,
            i,
            i === 0,
          ]
        );
      }

      insertedCount++;
    }

    await client.query("COMMIT");
    invalidateProductsCache();

    return NextResponse.json({
      success: true,
      count: insertedCount,
      message: `Successfully seeded ${insertedCount} Akoni demo products with variants and gallery images.`,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("POST /api/admin/demo-products error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to seed demo products" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE() {
  try {
    const res = await query(
      "DELETE FROM public.products WHERE specs->>'is_demo' = 'true' RETURNING id"
    );

    invalidateProductsCache();

    return NextResponse.json({
      success: true,
      deletedCount: res.rowCount || 0,
      message: `Successfully purged ${res.rowCount || 0} demo products and all associated variants/images.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/demo-products error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete demo products" },
      { status: 500 }
    );
  }
}
