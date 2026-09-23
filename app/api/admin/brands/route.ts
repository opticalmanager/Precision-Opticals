import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET() {
  try {
    const res = await query(
      `SELECT b.*, COUNT(p.id) as product_count
       FROM public.brands b
       LEFT JOIN public.products p ON p.brand_id = b.id
       GROUP BY b.id
       ORDER BY b.is_featured DESC, b.name ASC;`
    );

    return NextResponse.json({
      success: true,
      brands: res.rows,
    });
  } catch (error: any) {
    console.error("Brands GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Brand name is required" }, { status: 400 });
    }

    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const origin = body.origin || "";
    const tagline = body.tagline || "";
    const description = body.description || "";
    const isFeatured = Boolean(body.isFeatured || body.is_featured);
    const isActive = body.isActive !== undefined ? body.isActive : true;

    const res = await query(
      `INSERT INTO public.brands (slug, name, origin, tagline, description, is_featured, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, origin = EXCLUDED.origin, tagline = EXCLUDED.tagline,
           description = EXCLUDED.description, is_featured = EXCLUDED.is_featured, is_active = EXCLUDED.is_active
       RETURNING *;`,
      [slug, name, origin, tagline, description, isFeatured, isActive]
    );

    return NextResponse.json({
      success: true,
      message: "Brand saved successfully",
      brand: res.rows[0],
    });
  } catch (error: any) {
    console.error("Brands POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save brand" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(body.name.trim());
    }
    if (body.origin !== undefined) {
      updates.push(`origin = $${idx++}`);
      values.push(body.origin.trim());
    }
    if (body.tagline !== undefined) {
      updates.push(`tagline = $${idx++}`);
      values.push(body.tagline.trim());
    }
    if (body.description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(body.description.trim());
    }
    if (body.is_featured !== undefined || body.isFeatured !== undefined) {
      updates.push(`is_featured = $${idx++}`);
      values.push(Boolean(body.is_featured ?? body.isFeatured));
    }
    if (body.is_active !== undefined || body.isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      values.push(Boolean(body.is_active ?? body.isActive));
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const res = await query(
      `UPDATE public.brands SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *;`,
      values
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      brand: res.rows[0],
    });
  } catch (error: any) {
    console.error("Brands PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    // Check if products exist for this brand
    const check = await query(`SELECT COUNT(*) as cnt FROM public.products WHERE brand_id = $1`, [id]);
    const prodCount = parseInt(check.rows[0]?.cnt || "0", 10);
    if (prodCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete brand with ${prodCount} associated product${prodCount > 1 ? "s" : ""}. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    const res = await query(`DELETE FROM public.brands WHERE id = $1 RETURNING id;`, [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    console.error("Brands DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
