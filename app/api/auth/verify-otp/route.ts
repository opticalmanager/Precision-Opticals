import { NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, otp, mode = "phone", name } = body;

    // Validate 4-digit code (demo code 1234 accepted)
    if (!otp || String(otp).trim() !== "1234") {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please enter 1234." },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : "";
    const userEmail = email ? email.trim().toLowerCase() : `patron.${cleanPhone.slice(-4) || "member"}@precisionoptics.com`;
    const userName = name?.trim() || "Alexander Sterling";

    let profile: any = null;
    let pastOrders: any[] = [];

    try {
      // 1. Check if profile exists by phone or email
      let res;
      if (mode === "phone" && formattedPhone) {
        res = await query(
          `SELECT id, full_name, email, phone, role, gem_loyalty_points, created_at
           FROM public.profiles
           WHERE phone = $1 OR email = $2
           LIMIT 1;`,
          [formattedPhone, userEmail]
        );
      } else {
        res = await query(
          `SELECT id, full_name, email, phone, role, gem_loyalty_points, created_at
           FROM public.profiles
           WHERE email = $1
           LIMIT 1;`,
          [userEmail]
        );
      }

      if (res && res.rows.length > 0) {
        profile = res.rows[0];
      } else {
        // 2. Create new profile in public.profiles
        const insertRes = await query(
          `INSERT INTO public.profiles (
            id, full_name, email, phone, role, gem_loyalty_points, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, 'customer', 500, NOW(), NOW()
          ) RETURNING id, full_name, email, phone, role, gem_loyalty_points, created_at;`,
          [userName, userEmail, formattedPhone || null]
        );
        if (insertRes && insertRes.rows.length > 0) {
          profile = insertRes.rows[0];
        }
      }

      // 3. Query existing orders associated with this phone or email
      if (profile) {
        const ordersRes = await query(
          `SELECT id, order_number, status, payment_status, payment_method,
                  subtotal, discount_amount, shipping_fee, total_amount,
                  shipping_address, tracking_number, courier_partner, estimated_delivery, created_at
           FROM public.orders
           WHERE customer_id = $1 OR guest_phone = $2 OR guest_email = $3
           ORDER BY created_at DESC
           LIMIT 10;`,
          [profile.id, formattedPhone, userEmail]
        );
        if (ordersRes && ordersRes.rows.length > 0) {
          pastOrders = ordersRes.rows;
        }
      }
    } catch (dbErr) {
      console.warn("[AUTH-OTP] PostgreSQL query fallback:", dbErr);
    }

    const resolvedUser = {
      id: profile?.id || `usr-${Date.now()}`,
      name: profile?.full_name || userName,
      email: profile?.email || userEmail,
      phone: profile?.phone || formattedPhone || "+91 98100 12345",
      role: profile?.role || "customer",
      joinedDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "October 2024",
      gemPoints: profile?.gem_loyalty_points || 850,
      savedAddresses: [
        {
          fullName: profile?.full_name || userName,
          phone: profile?.phone || formattedPhone || "+91 98100 12345",
          email: profile?.email || userEmail,
          streetAddress: "Villa 42, Magnolias Boulevard, Golf Course Road",
          city: "Gurugram",
          state: "Haryana",
          pincode: "122002",
          country: "India",
        },
      ],
      savedPrescriptions: [
        {
          id: "rx-01",
          title: "Current Progressive Vision",
          date: "2026-01-15",
          doctorName: "Dr. R. K. Malhotra (Precision Optometry)",
          data: {
            rightEye: { sph: "-1.50", cyl: "-0.75", axis: "90", add: "+1.50" },
            leftEye: { sph: "-1.75", cyl: "-0.50", axis: "85", add: "+1.50" },
            pd: "64",
          },
        },
      ],
    };

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: resolvedUser,
      ordersCount: pastOrders.length,
    });
  } catch (error) {
    console.error("[AUTH-OTP] verify-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify authentication code" },
      { status: 500 }
    );
  }
}
