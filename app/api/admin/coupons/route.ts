import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET() {
  try {
    const couponsRes = await query(
      `SELECT * FROM public.coupons ORDER BY created_at DESC;`
    );

    return NextResponse.json({
      success: true,
      coupons: couponsRes.rows,
    });
  } catch (error: any) {
    console.error("Coupons GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const discountType = body.discountType || "percentage";
    const discountValue = Number(body.discountValue || 10);
    const minOrderValue = Number(body.minOrderValue || 0);
    const maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : null;
    const usageLimit = Number(body.usageLimit || 500);
    const validUntil = body.validUntil || new Date(Date.now() + 365 * 86400000).toISOString();
    const isActive = body.isActive !== undefined ? body.isActive : true;

    const res = await query(
      `INSERT INTO public.coupons (
        code, discount_type, discount_value, min_order_value, max_discount, usage_limit, valid_until, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (code) DO UPDATE
      SET discount_value = EXCLUDED.discount_value, min_order_value = EXCLUDED.min_order_value, is_active = EXCLUDED.is_active
      RETURNING *;`,
      [code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, validUntil, isActive]
    );

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon: res.rows[0],
    });
  } catch (error: any) {
    console.error("Coupons POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, discountValue } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (isActive !== undefined) {
      updates.push(`is_active = $${pIdx}`);
      params.push(Boolean(isActive));
      pIdx++;
    }

    if (discountValue !== undefined) {
      updates.push(`discount_value = $${pIdx}`);
      params.push(Number(discountValue));
      pIdx++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    params.push(id);
    const res = await query(
      `UPDATE public.coupons
       SET ${updates.join(", ")}
       WHERE id = $${pIdx} OR code = $${pIdx}
       RETURNING *;`,
      params
    );

    return NextResponse.json({
      success: true,
      message: "Coupon updated",
      coupon: res.rows[0],
    });
  } catch (error: any) {
    console.error("Coupons PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 });
    }

    await query(`DELETE FROM public.coupons WHERE id::text = $1 OR code = $1;`, [id]);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error: any) {
    console.error("Coupons DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
