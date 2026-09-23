import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { query } from "@/lib/adminDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount specified" },
        { status: 400 }
      );
    }

    // Determine amount in paise:
    // Razorpay standard request specifies amount in paise. Minimum amount is 100 paise (₹1).
    let amountInPaise: number;
    if (body.isPaise === true) {
      amountInPaise = Math.round(numAmount);
    } else if (body.isPaise === false) {
      amountInPaise = Math.round(numAmount * 100);
    } else {
      // If caller sent amount >= 100, treat as paise if it matches standard or check
      // For precision optics checkout, we send paise directly.
      amountInPaise = Math.round(numAmount);
    }

    // Step 1: Validate amount >= 100 paise
    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    // Dynamic resolution of credentials from environment or admin_settings
    let activeKeyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TfX2gVZqD6Ern5";
    let activeKeySecret =
      process.env.RAZORPAY_KEY_SECRET || "9lrOQWoB18TQgHvX46AcBk2a";

    // Use fast in-memory check to avoid slow database pooler round-trips
    try {
      const settingsRes = await query(
        `SELECT value FROM public.admin_settings WHERE key = 'payments' LIMIT 1;`
      );
      if (settingsRes.rows.length > 0) {
        let val = settingsRes.rows[0].value;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {}
        }
        if (val?.razorpayUpi?.keyId && !val.razorpayUpi.keyId.includes("•")) {
          activeKeyId = val.razorpayUpi.keyId;
        }
      }
    } catch (dbErr) {
      console.warn("[RAZORPAY] Database settings read fallback:", dbErr);
    }

    const orderReceipt = receipt || `rcpt_${Date.now()}`;

    // Step 1: Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const razorpay = new Razorpay({
      key_id: activeKeyId,
      key_secret: activeKeySecret,
    });

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
        notes: {
          ...notes,
          store: "Precision Optics Luxury Atelier",
        },
      });

      // Return: { order_id, amount, currency }
      return NextResponse.json({
        success: true,
        order_id: order.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: activeKeyId,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      });
    } catch (rzpErr: any) {
      console.error("[RAZORPAY] Razorpay API order creation notice:", rzpErr);

      // Handle auth failures (return 401 with clear actionable guidance)
      if (
        rzpErr?.statusCode === 401 ||
        (rzpErr?.error?.code === "BAD_REQUEST_ERROR" &&
          rzpErr?.error?.description?.toLowerCase().includes("auth"))
      ) {
        return NextResponse.json(
          {
            success: false,
            code: "AUTH_FAILED",
            error:
              "Razorpay Authentication Failed: The API Key Secret does not match Key ID '" +
              activeKeyId +
              "'. Please generate a new key pair in your Razorpay Dashboard (Settings > API Keys) and update .env.local.",
          },
          { status: 401 }
        );
      }

      // Handle Razorpay API errors (return 500)
      return NextResponse.json(
        {
          success: false,
          error:
            rzpErr?.error?.description ||
            rzpErr?.message ||
            "Razorpay API error while creating order",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[RAZORPAY] create-order endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initialize payment gateway order" },
      { status: 500 }
    );
  }
}
