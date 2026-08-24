import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackingNumber = body.trackingNumber || `PO-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      orderId: body.id || trackingNumber,
      trackingNumber,
      message: "Order received for optical laboratory assembly",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process order" },
      { status: 500 }
    );
  }
}
