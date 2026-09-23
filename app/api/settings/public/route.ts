import { NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

function parseSettingValue(rawVal: any) {
  if (rawVal === null || rawVal === undefined) return null;
  if (typeof rawVal === "string") {
    try {
      const parsed = JSON.parse(rawVal);
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }
      return parsed;
    } catch {
      return rawVal;
    }
  }
  return rawVal;
}

export async function GET() {
  try {
    const res = await query(
      `SELECT key, value FROM public.admin_settings WHERE key IN ('shipping', 'payments', 'general');`
    );

    const settingsMap: Record<string, any> = {};
    for (const r of res.rows) {
      settingsMap[r.key] = parseSettingValue(r.value);
    }

    // Default fallbacks in case settings table is empty
    const shipping = settingsMap["shipping"] || {
      freeShippingThreshold: 5000,
      standardShippingFee: 250,
      expressShippingFee: 490,
      defaultCarrier: "BlueDart Express",
    };

    const rawPayments = settingsMap["payments"] || {};
    const razorpayKeyId =
      rawPayments.razorpayUpi?.keyId ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TfV4G6DOOj6ykQ";
    const razorpayMode =
      rawPayments.razorpayUpi?.mode ||
      process.env.RAZORPAY_MODE ||
      "test";

    const payments = {
      razorpayUpi: {
        enabled: rawPayments.razorpayUpi?.enabled ?? true,
        keyId: razorpayKeyId,
        mode: razorpayMode,
      },
      stripe: {
        enabled: rawPayments.stripe?.enabled ?? true,
      },
      cod: {
        enabled: rawPayments.cod?.enabled ?? true,
        minOrderValue: rawPayments.cod?.minOrderValue ?? 2000,
        maxOrderValue: rawPayments.cod?.maxOrderValue ?? 50000,
      },
      netbanking: {
        enabled: rawPayments.netbanking?.enabled ?? true,
        supportedBanks: rawPayments.netbanking?.supportedBanks || [
          "HDFC Bank",
          "ICICI Bank",
          "State Bank of India",
          "Axis Bank",
        ],
      },
    };

    const general = settingsMap["general"] || {
      storeName: "Precision Optics (Estd. 1969)",
      tagline: "Luxury Eyewear & Clinical Optometry Atelier",
      email: "concierge@precisionoptics.in",
      phone: "+91 98100 12345",
      address: "JMD Regent Arcade, Sector 104, Golf Course Road, Gurugram, Haryana - 122002",
      operatingHours: "Monday - Sunday: 10:30 AM - 08:30 PM",
    };

    return NextResponse.json(
      {
        success: true,
        shipping,
        payments,
        general,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Public settings API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load public settings",
      },
      { status: 500 }
    );
  }
}
