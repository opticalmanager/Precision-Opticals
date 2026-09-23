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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(body.name.trim());
    }
    if (body.description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(body.description.trim());
    }
    if (body.displayOrder !== undefined || body.display_order !== undefined) {
      updates.push(`display_order = $${idx++}`);
      values.push(Number(body.displayOrder ?? body.display_order));
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
      `UPDATE public.categories SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *;`,
      values
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: res.rows[0],
    });
  } catch (error: any) {
    console.error("Categories PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    // Check if products exist for this category
    const check = await query(`SELECT COUNT(*) as cnt FROM public.products WHERE category_id = $1`, [id]);
    const prodCount = parseInt(check.rows[0]?.cnt || "0", 10);
    if (prodCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${prodCount} associated product${prodCount > 1 ? "s" : ""}. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    const res = await query(`DELETE FROM public.categories WHERE id = $1 RETURNING id;`, [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
