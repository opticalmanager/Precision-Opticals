import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/adminDb";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "prec_optics_webhook_secret_2026";

    // 1. Verify webhook signature
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const sigA = Buffer.from(expectedSignature, "utf8");
      const sigB = Buffer.from(signature, "utf8");

      if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
        console.error("[RAZORPAY-WEBHOOK] Invalid webhook signature detected");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[RAZORPAY-WEBHOOK] Received event: ${event}`);

    // 2. Handle Asynchronous Settlement Events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const paymentId = paymentEntity?.id;
      const orderNumber = paymentEntity?.notes?.orderNumber || paymentEntity?.description;

      if (orderNumber && paymentId) {
        await query(
          `UPDATE public.orders
           SET payment_status = 'paid',
               payment_id = COALESCE(payment_id, $1),
               updated_at = NOW()
           WHERE order_number = $2 OR tracking_number = $2;`,
          [paymentId, orderNumber]
        );
        console.log(`[RAZORPAY-WEBHOOK] Order ${orderNumber} settled as paid (Payment: ${paymentId})`);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderNumber = paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        await query(
          `UPDATE public.orders
           SET payment_status = 'failed',
               updated_at = NOW()
           WHERE order_number = $1 OR tracking_number = $1;`,
          [orderNumber]
        );
        console.warn(`[RAZORPAY-WEBHOOK] Order ${orderNumber} payment marked as failed`);
      }
    }

    return NextResponse.json({ status: "processed", event });
  } catch (error: any) {
    console.error("[RAZORPAY-WEBHOOK] Error processing webhook:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing error" }, { status: 500 });
  }
}
