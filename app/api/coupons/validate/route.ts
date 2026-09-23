import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body.code?.trim().toUpperCase();
    const orderAmount = Number(body.orderAmount || 0);

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: "Please enter a promo code" },
        { status: 400 }
      );
    }

    const res = await query(
      `SELECT * FROM public.coupons WHERE UPPER(code) = $1 LIMIT 1;`,
      [rawCode]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Privilege code "${rawCode}" is invalid.`,
        },
        { status: 404 }
      );
    }

    const coupon = res.rows[0];

    // 1. Check active status
    if (!coupon.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: `Code "${rawCode}" is no longer active.`,
        },
        { status: 400 }
      );
    }

    // 2. Check expiration date
    if (coupon.valid_until) {
      const expiry = new Date(coupon.valid_until).getTime();
      if (Date.now() > expiry) {
        return NextResponse.json(
          {
            success: false,
            error: `Code "${rawCode}" expired on ${new Date(coupon.valid_until).toLocaleDateString("en-IN")}.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Check min order value
    const minOrder = Number(coupon.min_order_value || 0);
    if (orderAmount > 0 && orderAmount < minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${minOrder.toLocaleString("en-IN")} required for this voucher (current bag: ₹${orderAmount.toLocaleString("en-IN")}).`,
        },
        { status: 400 }
      );
    }

    // 4. Check usage limit
    const usageLimit = coupon.usage_limit ? Number(coupon.usage_limit) : null;
    const usageCount = Number(coupon.usage_count || 0);
    if (usageLimit !== null && usageCount >= usageLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Code "${rawCode}" has reached its maximum redemption limit.`,
        },
        { status: 400 }
      );
    }

    // 5. Calculate discount amount
    const discountType = coupon.discount_type || "percentage";
    const discountValue = Number(coupon.discount_value || 0);
    const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : null;

    let calculatedDiscount = 0;
    if (discountType === "percentage") {
      calculatedDiscount = Math.round((orderAmount * discountValue) / 100);
      if (maxDiscount !== null && calculatedDiscount > maxDiscount) {
        calculatedDiscount = maxDiscount;
      }
    } else {
      // Fixed discount
      calculatedDiscount = Math.min(discountValue, orderAmount);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType,
        discountValue,
        discountAmount: calculatedDiscount,
        minOrderValue: minOrder,
        maxDiscount,
      },
      message:
        discountType === "percentage"
          ? `${discountValue}% luxury discount applied!`
          : `₹${discountValue.toLocaleString("en-IN")} voucher applied!`,
    });
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to validate coupon",
      },
      { status: 500 }
    );
  }
}
