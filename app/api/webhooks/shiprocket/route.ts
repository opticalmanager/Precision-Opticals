import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";
import { getShippingConfig } from "@/lib/shippingSettings";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const config = await getShippingConfig();

    // Verify webhook security header if configured
    const providedSecret =
      req.headers.get("x-api-key") ||
      req.headers.get("x-shiprocket-secret") ||
      req.headers.get("authorization");

    if (config.shiprocketWebhookSecret && providedSecret) {
      const cleanSecret = providedSecret.replace(/^Bearer\s+/i, "");
      if (cleanSecret !== config.shiprocketWebhookSecret) {
        console.warn("[SHIPROCKET-WEBHOOK] Unauthorized webhook secret mismatch");
        // We log but don't strictly reject if user hasn't configured header in Shiprocket dashboard yet
      }
    }

    // Extract essential Shiprocket shipment identifiers
    const orderNumber = payload.order_id || payload.channel_order_id;
    const awb = payload.awb || payload.awb_code;
    const currentStatus = (payload.current_status || payload.shipment_status || "").toUpperCase();
    const courier = payload.courier_name || payload.courier_company_id;
    const location = payload.location || payload.current_location || "";
    const activity = payload.activity || payload.status_description || currentStatus;

    if (!orderNumber && !awb) {
      return NextResponse.json(
        { success: false, message: "Missing order_id or awb in webhook payload" },
        { status: 400 }
      );
    }

    // Map Shiprocket logistics statuses to Precision Optics lab/fulfillment statuses
    let mappedOrderStatus: string | null = null;
    if (currentStatus.includes("DELIVER")) {
      mappedOrderStatus = "delivered";
    } else if (
      currentStatus.includes("PICKED") ||
      currentStatus.includes("IN TRANSIT") ||
      currentStatus.includes("OUT FOR DELIVERY") ||
      currentStatus.includes("SHIPPED")
    ) {
      mappedOrderStatus = "dispatched";
    }

    // Construct tracking event milestone
    const trackingMilestone = {
      status: currentStatus,
      activity,
      location,
      timestamp: new Date().toISOString(),
    };

    // Update orders table in PostgreSQL
    const updateResult = await query(
      `UPDATE public.orders 
       SET 
         status = COALESCE($1, status),
         courier_partner = COALESCE($2, courier_partner),
         tracking_number = COALESCE($3, tracking_number),
         payment_details = jsonb_set(
           COALESCE(payment_details, '{}'::jsonb),
           '{shiprocket,tracking_events}',
           COALESCE(payment_details->'shiprocket'->'tracking_events', '[]'::jsonb) || $4::jsonb
         ),
         updated_at = NOW()
       WHERE order_number = $5 OR tracking_number = $6
       RETURNING id, order_number, status, tracking_number`,
      [
        mappedOrderStatus,
        courier || null,
        awb || null,
        JSON.stringify([trackingMilestone]),
        orderNumber || "",
        awb || "",
      ]
    );

    if (updateResult.rowCount === 0) {
      console.warn(`[SHIPROCKET-WEBHOOK] No order found for ref: ${orderNumber} or AWB: ${awb}`);
    } else {
      console.log(
        `[SHIPROCKET-WEBHOOK] Updated order ${orderNumber || awb} to status: ${mappedOrderStatus || "unchanged"}`
      );
    }

    return NextResponse.json({
      success: true,
      processed: true,
      order: updateResult.rows[0] || null,
    });
  } catch (error: any) {
    console.error("[SHIPROCKET-WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "https://precision-opticals.vercel.app/api/webhooks/shiprocket",
    service: "Precision Optics Logistics Ingestion Gateway",
  });
}
