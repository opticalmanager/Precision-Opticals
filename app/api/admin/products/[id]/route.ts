import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prodRes = await query(
      `SELECT 
        p.*,
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
        ), '[]'::json) as variants
      FROM public.products p
      LEFT JOIN public.brands b ON b.id = p.brand_id
      LEFT JOIN public.categories c ON c.id = p.category_id
      WHERE p.id::text = $1 OR p.slug = $1
      LIMIT 1;`,
      [id]
    );

    if (prodRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: prodRes.rows[0],
    });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

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

    const tryOnEnabled = body.tryOnEnabled !== undefined ? Boolean(body.tryOnEnabled) : null;
    const tryOnModelUrl = body.tryOnModelUrl !== undefined ? body.tryOnModelUrl : null;
    const tryOnConfiguration = body.tryOnConfiguration ? (typeof body.tryOnConfiguration === "string" ? body.tryOnConfiguration : JSON.stringify(body.tryOnConfiguration)) : null;

    // Update product
    const updateRes = await query(
      `UPDATE public.products
       SET name = $1, subtitle = $2, base_price = $3, original_price = $4,
           gender = $5, shape = $6, rim_type = $7, material = $8,
           color = $9, color_hex = $10, brand_id = COALESCE($11, brand_id),
           category_id = COALESCE($12, category_id), lens_properties = $13,
           specs = $14, description = $15, is_active = $16,
           is_new_arrival = COALESCE($17, is_new_arrival),
           is_best_seller = COALESCE($18, is_best_seller),
           try_on_enabled = COALESCE($19, try_on_enabled),
           try_on_model_url = COALESCE($20, try_on_model_url),
           try_on_configuration = COALESCE($21, try_on_configuration),
           updated_at = NOW()
       WHERE id::text = $22 OR slug = $22
       RETURNING id, slug, name;`,
      [
        name, subtitle, basePrice, originalPrice, gender, shape, rimType, material,
        color, colorHex, brandId, categoryId, lensProperties, JSON.stringify(specs),
        description, isActive, body.isNewArrival, body.isBestSeller,
        tryOnEnabled, tryOnModelUrl, tryOnConfiguration, id
      ]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found to update" }, { status: 404 });
    }

    const productId = updateRes.rows[0].id;

    // Update/Replace Variants if provided
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      for (const v of body.variants) {
        if (v.id) {
          await query(
            `UPDATE public.product_variants
             SET color_name = $1, color_hex = $2, stock_quantity = $3, updated_at = NOW()
             WHERE id = $4 AND product_id = $5`,
            [v.colorName || v.color_name, v.colorHex || v.color_hex, Number(v.stockQuantity || v.stock || 0), v.id, productId]
          );
        } else {
          const sku = v.sku || `SKU-${updateRes.rows[0].slug.slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
          await query(
            `INSERT INTO public.product_variants (product_id, color_name, color_hex, sku, stock_quantity)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;`,
            [productId, v.colorName || v.color_name || color, v.colorHex || v.color_hex || colorHex, sku, Number(v.stock || v.stock_quantity || 10)]
          );
        }
      }
    }

    // Update Images if provided
    if (Array.isArray(body.images) && body.images.length > 0) {
      // Clear old and insert new set
      await query("DELETE FROM public.product_images WHERE product_id = $1;", [productId]);
      for (let i = 0; i < body.images.length; i++) {
        const url = typeof body.images[i] === "string" ? body.images[i] : body.images[i].url;
        if (url) {
          await query(
            `INSERT INTO public.product_images (product_id, url, alt_text, display_order, is_primary)
             VALUES ($1, $2, $3, $4, $5);`,
            [productId, url, `${name} photo ${i + 1}`, i, i === 0]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully in catalog",
      product: updateRes.rows[0],
    });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = ["is_active", "base_price", "original_price", "is_new_arrival", "is_best_seller"];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIdx++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for partial update" },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const queryStr = `
      UPDATE public.products
      SET ${updates.join(", ")}
      WHERE id::text = $${paramIdx} OR slug = $${paramIdx}
      RETURNING id, name, slug, is_active, base_price, updated_at;
    `;

    const res = await query(queryStr, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: res.rows[0],
    });
  } catch (error: any) {
    console.error("Product PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Safe soft delete / archive by setting is_active = false
    const archiveRes = await query(
      `UPDATE public.products SET is_active = false, updated_at = NOW()
       WHERE id::text = $1 OR slug = $1
       RETURNING id, name;`,
      [id]
    );

    if (archiveRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product archived from catalog",
      productId: archiveRes.rows[0].id,
    });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to archive product" },
      { status: 500 }
    );
  }
}

