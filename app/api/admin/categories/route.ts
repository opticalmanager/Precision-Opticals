import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET() {
  try {
    const res = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM public.categories c
       LEFT JOIN public.products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC;`
    );

    return NextResponse.json({
      success: true,
      categories: res.rows,
    });
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const description = body.description || "";
    const displayOrder = Number(body.displayOrder || body.display_order || 0);
    const isActive = body.isActive !== undefined ? body.isActive : true;

    const res = await query(
      `INSERT INTO public.categories (slug, name, description, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = EXCLUDED.is_active
       RETURNING *;`,
      [slug, name, description, displayOrder, isActive]
    );

    return NextResponse.json({
      success: true,
      message: "Category saved successfully",
      category: res.rows[0],
    });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save category" },
      { status: 500 }
    );
  }
}
