import { NextRequest, NextResponse } from "next/server";
import {
  getShiprocketToken,
  checkCourierServiceability,
  bookShiprocketShipment,
} from "@/lib/shiprocketClient";
import { getShippingConfig } from "@/lib/shippingSettings";
import { query } from "@/lib/adminDb";

// 1. GET: Test live connection, token status, and pickup location details
export async function GET(req: NextRequest) {
  try {
    const config = await getShippingConfig();
    const { token, error } = await getShiprocketToken(true); // force live test

    return NextResponse.json({
      success: true,
      connected: Boolean(token),
      message: token
        ? "Successfully authenticated with Shiprocket Logistics API"
        : error || "API credentials stored. Verify API User in Shiprocket dashboard.",
      email: config.shiprocketEmail,
      pickupLocation: config.shiprocketPickupLocation,
      pickupAddress: config.shiprocketPickupAddress,
      pickupCity: config.shiprocketPickupCity,
      pickupState: config.shiprocketPickupState,
      pickupPincode: config.shiprocketPickupPincode,
      fulfillmentMode: config.fulfillmentMode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, connected: false, message: err.message },
      { status: 500 }
    );
  }
}

// 2. POST: Actions (calculate_rates, book_shipment, update_pickup_location)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "calculate_rates";
    const config = await getShippingConfig();

    if (action === "update_pickup_location") {
      const { pickupLocation, pickupAddress, pickupCity, pickupState, pickupPincode } = body;
      const updated = {
        ...config,
        shiprocketPickupLocation: pickupLocation || config.shiprocketPickupLocation,
        shiprocketPickupAddress: pickupAddress || config.shiprocketPickupAddress,
        shiprocketPickupCity: pickupCity || config.shiprocketPickupCity,
        shiprocketPickupState: pickupState || config.shiprocketPickupState,
        shiprocketPickupPincode: pickupPincode || config.shiprocketPickupPincode,
      };

      await query(
        `INSERT INTO public.admin_settings (key, value)
         VALUES ('shipping', $1::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = $1::jsonb;`,
        [JSON.stringify(updated)]
      );

      return NextResponse.json({
        success: true,
        message: "Pickup location updated successfully",
        pickupLocation: updated.shiprocketPickupLocation,
        pickupAddress: updated.shiprocketPickupAddress,
        pickupCity: updated.shiprocketPickupCity,
        pickupState: updated.shiprocketPickupState,
        pickupPincode: updated.shiprocketPickupPincode,
      });
    }

    if (action === "calculate_rates") {
      const deliveryPincode = body.deliveryPincode?.trim();
      const pickupPincode = body.pickupPincode?.trim() || config.shiprocketPickupPincode || "201316";

      if (!deliveryPincode || !/^\d{6}$/.test(deliveryPincode)) {
        return NextResponse.json(
          { success: false, message: "Valid 6-digit delivery pincode is required" },
          { status: 400 }
        );
      }

      const result = await checkCourierServiceability({
        deliveryPincode,
        pickupPincode,
        weightKg: Number(body.weightKg) || 0.35,
        cod: Boolean(body.cod),
      });

      return NextResponse.json({
        ...result,
        pickupLocation: config.shiprocketPickupLocation,
        pickupAddress: config.shiprocketPickupAddress,
        pickupCity: config.shiprocketPickupCity,
        pickupState: config.shiprocketPickupState,
        pickupPincode,
      });
    }

    if (action === "book_shipment") {
      const orderId = body.orderId;
      const courierId = body.courierId ? Number(body.courierId) : undefined;
      const pickupLocation = body.pickupLocation?.trim() || config.shiprocketPickupLocation || "precision optics";
      const deliveryCost = body.deliveryCost ? Number(body.deliveryCost) : undefined;

      if (!orderId) {
        return NextResponse.json(
          { success: false, message: "Order ID is required" },
          { status: 400 }
        );
      }

      // Fetch order from database
      const orderRes = await query(
        `SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'name', oi.product_snapshot->>'name',
                'sku', oi.product_snapshot->>'sku',
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'
          ) as items
        FROM public.orders o
        LEFT JOIN public.order_items oi ON oi.order_id = o.id
        WHERE o.id = $1 OR o.order_number = $1
        GROUP BY o.id
        LIMIT 1;`,
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Order not found in database" },
          { status: 404 }
        );
      }

      const order = orderRes.rows[0];
      const shipping = order.shipping_address || {};
      const items = (order.items || []).map((it: any) => ({
        name: it.name || "Precision Luxury Eyewear",
        sku: it.sku || `SKU-${order.order_number}`,
        units: Number(it.quantity || 1),
        sellingPrice: Number(it.unit_price || it.total_price || order.total_amount),
      }));

      const bookingResult = await bookShiprocketShipment({
        orderNumber: order.order_number,
        orderDate: order.created_at,
        customerName: shipping.fullName || "Valued Patron",
        customerEmail: order.guest_email || "client@precisionoptics.com",
        customerPhone: order.guest_phone || shipping.phone || "9810012345",
        address: {
          streetAddress: shipping.streetAddress || "Atelier Delivery Address",
          city: shipping.city || "Delhi",
          state: shipping.state || "Delhi",
          pincode: shipping.pincode || "110001",
          country: shipping.country || "India",
        },
        items: items.length > 0 ? items : [{ name: "Precision Eyewear", units: 1, sellingPrice: Number(order.total_amount) }],
        subtotal: Number(order.subtotal || order.total_amount),
        paymentMethod: order.payment_method === "cod" ? "cod" : "prepaid",
        courierId,
        pickupLocation,
      });

      if (bookingResult.success && bookingResult.awbCode) {
        // Update database order record with tracking number and courier
        const shipmentMetadata = {
          shiprocketOrderId: bookingResult.orderId,
          shiprocketShipmentId: bookingResult.shipmentId,
          awbCode: bookingResult.awbCode,
          courierName: bookingResult.courierName,
          labelUrl: bookingResult.labelUrl,
          pickupLocation,
          deliveryCost,
          bookedAt: new Date().toISOString(),
          isSimulation: bookingResult.isSimulation || false,
        };

        await query(
          `UPDATE public.orders 
           SET 
             tracking_number = $1,
             courier_partner = $2,
             status = 'dispatched',
             payment_details = jsonb_set(
               COALESCE(payment_details, '{}'::jsonb),
               '{shiprocket}',
               $3::jsonb
             ),
             updated_at = NOW()
           WHERE id = $4`,
          [
            bookingResult.awbCode,
            bookingResult.courierName,
            JSON.stringify(shipmentMetadata),
            order.id,
          ]
        );

        return NextResponse.json({
          success: true,
          message: `Consignment booked with ${bookingResult.courierName}. AWB: ${bookingResult.awbCode}`,
          booking: shipmentMetadata,
        });
      } else {
        return NextResponse.json(
          { success: false, message: bookingResult.error || "Failed to book shipment with courier" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[ADMIN-SHIPROCKET] API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
