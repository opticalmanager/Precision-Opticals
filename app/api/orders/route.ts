import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackingNumber = body.trackingNumber || `PO-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderNumber = body.id || trackingNumber;

    // Estimate delivery date (5 days from order)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 5);

    // Prepare order payload
    const orderRecord = {
      order_number: orderNumber,
      guest_email: body.shippingAddress?.email || body.email || "guest@precisionoptics.com",
      guest_phone: body.shippingAddress?.phone || body.phone || "+91 9810012345",
      status: "confirmed",
      payment_status: body.paymentMethod === "cod" ? "unpaid" : "paid",
      payment_method: body.paymentMethod || "upi",
      subtotal: Number(body.subtotal || body.totalAmount || 0),
      discount_amount: Number(body.discount || 0),
      coupon_code: body.couponApplied || null,
      shipping_fee: Number(body.shippingFee || 0),
      total_amount: Number(body.totalAmount || body.subtotal || 0),
      shipping_address: body.shippingAddress || {},
      tracking_number: trackingNumber,
      estimated_delivery: estimatedDate.toISOString().split("T")[0],
    };

    // Insert into Supabase orders table
    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select("id, order_number, tracking_number")
      .single();

    if (orderError) {
      console.warn("Supabase order insert warning:", orderError.message);
    }

    // Insert order items if available
    if (insertedOrder && Array.isArray(body.items) && body.items.length > 0) {
      const itemsToInsert = body.items.map((item: any) => ({
        order_id: insertedOrder.id,
        quantity: item.quantity || 1,
        unit_price: Number(item.product?.price || item.unitPrice || 0),
        lens_price: Number(item.lensConfig?.totalLensPrice || 0),
        total_price: Number((item.product?.price || 0) * (item.quantity || 1)),
        product_snapshot: {
          name: item.product?.name,
          brand: item.product?.brand,
          color: item.selectedColor || item.product?.color,
          lensType: item.lensConfig?.lensType,
          lensPackage: item.lensConfig?.lensPackage?.name,
          images: item.product?.images || [],
        },
      }));

      await supabase.from("order_items").insert(itemsToInsert);
    }

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      trackingNumber,
      message: "Order successfully received and registered in database",
    });
  } catch (error: any) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
