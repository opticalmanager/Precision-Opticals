import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { query } from "@/lib/adminDb";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

const OTP_PEPPER = process.env.OTP_SECRET_PEPPER || "precision_optics_super_secure_otp_pepper_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, otp, name } = body;

    // 1. Validate and normalize phone number
    const normalized = normalizePhoneNumber(phone);
    if (!normalized.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: normalized.error || "Please enter a valid 10-digit mobile number",
        },
        { status: 400 }
      );
    }

    const canonicalPhone = normalized.e164; // e.g. "+919810012345"
    const rawOtp = String(otp || "").trim();

    // 2. Validate 6-digit numeric OTP format
    if (!/^\d{6}$/.test(rawOtp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a complete 6-digit verification code",
        },
        { status: 400 }
      );
    }

    // 3. Look up active, unexpired OTP verification record
    const recordRes = await query(
      `SELECT id, phone, otp_hash, channel, attempts, max_attempts, expires_at
       FROM public.otp_verifications
       WHERE phone = $1 AND verified_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1;`,
      [canonicalPhone]
    );

    if (recordRes.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code expired or not found. Please request a new code.",
        },
        { status: 400 }
      );
    }

    const record = recordRes.rows[0];

    // 4. Check maximum attempts limit
    if (record.attempts >= record.max_attempts) {
      // Invalidate record
      await query(
        `UPDATE public.otp_verifications SET verified_at = NOW() WHERE id = $1;`,
        [record.id]
      );
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please request a new verification code.",
        },
        { status: 400 }
      );
    }

    // 5. Compute candidate SHA-256 hash using the same salt & pepper
    const candidateHash = crypto
      .createHash("sha256")
      .update(`${canonicalPhone}:${rawOtp}:${OTP_PEPPER}`)
      .digest("hex");

    // Increment attempts counter in database
    await query(
      `UPDATE public.otp_verifications SET attempts = attempts + 1 WHERE id = $1;`,
      [record.id]
    );

    // 6. Timing-safe comparison of OTP hashes
    let isMatch = false;
    try {
      isMatch = crypto.timingSafeEqual(
        Buffer.from(candidateHash, "hex"),
        Buffer.from(record.otp_hash, "hex")
      );
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      const remainingAttempts = record.max_attempts - (record.attempts + 1);
      const attemptWarning =
        remainingAttempts > 0
          ? ` (${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining)`
          : "";

      if (remainingAttempts <= 0) {
        await query(
          `UPDATE public.otp_verifications SET verified_at = NOW() WHERE id = $1;`,
          [record.id]
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid verification code. Please check the code and try again.${attemptWarning}`,
        },
        { status: 400 }
      );
    }

    // 7. Success: Mark OTP record as verified
    await query(
      `UPDATE public.otp_verifications SET verified_at = NOW() WHERE id = $1;`,
      [record.id]
    );

    const userName = name?.trim() || "";
    let profile: any = null;
    let pastOrders: any[] = [];

    // 8. Find or create profile by canonical phone
    const existingProfileRes = await query(
      `SELECT id, full_name, email, phone, role, gem_loyalty_points, created_at, phone_verified
       FROM public.profiles
       WHERE phone = $1
       LIMIT 1;`,
      [canonicalPhone]
    );

    if (existingProfileRes.rows.length > 0) {
      // Profile exists: update phone verification status
      const updateRes = await query(
        `UPDATE public.profiles
         SET phone_verified = true,
             phone_verified_at = NOW(),
             phone_verification_channel = $2,
             full_name = COALESCE(NULLIF($3, ''), full_name),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, full_name, email, phone, role, gem_loyalty_points, created_at;`,
        [existingProfileRes.rows[0].id, record.channel, userName]
      );
      profile = updateRes.rows[0] || existingProfileRes.rows[0];
    } else {
      // Create new customer profile with verified phone
      const insertRes = await query(
        `INSERT INTO public.profiles (
          id, full_name, email, phone, role, gem_loyalty_points,
          phone_verified, phone_verified_at, phone_verification_channel,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, NULL, $2, 'customer', 500,
          true, NOW(), $3,
          NOW(), NOW()
        ) RETURNING id, full_name, email, phone, role, gem_loyalty_points, created_at;`,
        [userName || "Valued Patron", canonicalPhone, record.channel]
      );
      profile = insertRes.rows[0];
    }

    // 9. Query past orders associated with this patron
    if (profile) {
      const ordersRes = await query(
        `SELECT id, order_number, status, payment_status, payment_method,
                subtotal, discount_amount, shipping_fee, total_amount,
                shipping_address, tracking_number, courier_partner, estimated_delivery, created_at
         FROM public.orders
         WHERE customer_id = $1 OR guest_phone = $2
         ORDER BY created_at DESC
         LIMIT 10;`,
        [profile.id, canonicalPhone]
      );
      if (ordersRes && ordersRes.rows.length > 0) {
        pastOrders = ordersRes.rows;
      }
    }

    // Extract saved address from latest past order if present
    let defaultSavedAddresses: any[] = [];
    if (pastOrders.length > 0 && pastOrders[0].shipping_address) {
      try {
        const addr =
          typeof pastOrders[0].shipping_address === "string"
            ? JSON.parse(pastOrders[0].shipping_address)
            : pastOrders[0].shipping_address;
        if (addr && addr.streetAddress) {
          defaultSavedAddresses.push(addr);
        }
      } catch {
        // Ignored
      }
    }

    const resolvedUser = {
      id: profile?.id || `usr-${Date.now()}`,
      name: profile?.full_name || userName || "Valued Patron",
      email: profile?.email || undefined,
      phone: profile?.phone || canonicalPhone,
      role: profile?.role || "customer",
      joinedDate: profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "October 2026",
      gemPoints: profile?.gem_loyalty_points || 500,
      phoneVerified: true,
      phoneVerificationChannel: record.channel || "whatsapp",
      savedAddresses: defaultSavedAddresses,
      savedPrescriptions: [],
    };

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: resolvedUser,
      ordersCount: pastOrders.length,
      orders: pastOrders,
    });
  } catch (error: any) {
    console.error("[AUTH-OTP] verify-otp route error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to verify authentication code" },
      { status: 500 }
    );
  }
}
