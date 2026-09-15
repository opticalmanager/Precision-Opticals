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
