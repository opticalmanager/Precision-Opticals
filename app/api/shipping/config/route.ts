import { NextResponse } from "next/server";
import { getShippingConfig } from "@/lib/shippingSettings";

export async function GET() {
  try {
    const config = await getShippingConfig();
    return NextResponse.json({
      success: true,
      freeShippingThreshold: config.freeShippingThreshold || 5000,
      standardShippingFee: config.standardShippingFee || 250,
      expressShippingFee: config.expressShippingFee || 490,
      defaultCarrier: config.defaultCarrier || "BlueDart Express",
      enableWhiteGloveHomeTrial: config.enableWhiteGloveHomeTrial ?? true,
      trialDepositAmount: config.trialDepositAmount || 3000,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        freeShippingThreshold: 5000,
        standardShippingFee: 250,
        expressShippingFee: 490,
        defaultCarrier: "BlueDart Express",
      },
      { status: 200 }
    );
  }
}
