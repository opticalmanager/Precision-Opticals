import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { query } from "@/lib/adminDb";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { sendWhatsAppOtp } from "@/lib/wacrmClient";
import { sendSmsOtp } from "@/lib/smsClient";

const OTP_PEPPER = process.env.OTP_SECRET_PEPPER || "precision_optics_super_secure_otp_pepper_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, channel = "whatsapp" } = body;

    // 1. Normalize and validate phone number
    const normalized = normalizePhoneNumber(phone);
    if (!normalized.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: normalized.error || "Please provide a valid 10-digit mobile number",
        },
        { status: 400 }
      );
    }

    const canonicalPhone = normalized.e164; // e.g. "+919810012345"

    // 2. Cooldown check: 60 seconds per phone number
    const recentOtpRes = await query(
      `SELECT created_at, EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago 
       FROM public.otp_verifications 
       WHERE phone = $1 AND verified_at IS NULL AND created_at > NOW() - INTERVAL '60 seconds'
       ORDER BY created_at DESC 
       LIMIT 1;`,
      [canonicalPhone]
    );

    if (recentOtpRes.rows.length > 0) {
      const secondsAgo = Math.floor(Number(recentOtpRes.rows[0].seconds_ago || 0));
      const remainingCooldown = Math.max(1, 60 - secondsAgo);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${remainingCooldown} seconds before requesting a new code.`,
          cooldownRemaining: remainingCooldown,
        },
        { status: 429 }
      );
    }

    // 3. Hourly rate limit: Max 6 requests per phone per hour
    const hourlyCountRes = await query(
      `SELECT COUNT(*) as request_count 
       FROM public.otp_verifications 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 hour';`,
      [canonicalPhone]
    );

    const hourlyCount = Number(hourlyCountRes.rows[0]?.request_count || 0);
    if (hourlyCount >= 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification rate limit exceeded. Please try again in an hour.",
        },
        { status: 429 }
      );
    }

    // 4. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 5. Compute salted SHA-256 hash (never persist plaintext OTP)
    const otpHash = crypto
      .createHash("sha256")
      .update(`${canonicalPhone}:${rawOtp}:${OTP_PEPPER}`)
      .digest("hex");

    // 6. Invalidate previous unverified OTPs for this phone number
    await query(
      `UPDATE public.otp_verifications 
       SET verified_at = NOW() 
       WHERE phone = $1 AND verified_at IS NULL;`,
      [canonicalPhone]
    );

    // 7. Store hashed OTP in database with 5-minute expiry
    const insertRes = await query(
      `INSERT INTO public.otp_verifications (
         phone, otp_hash, channel, attempts, max_attempts, expires_at, created_at
       ) VALUES ($1, $2, $3, 0, 5, NOW() + INTERVAL '5 minutes', NOW())
       RETURNING id;`,
      [canonicalPhone, otpHash, channel === "sms" ? "sms" : "whatsapp"]
    );

    const verificationRecordId = insertRes.rows[0]?.id;

    // 8. Deliver OTP via requested channel
    let deliverySuccess = false;
    let actualChannel = channel === "sms" ? "sms" : "whatsapp";
    let fallbackUsed = false;

    if (actualChannel === "whatsapp") {
      const waResult = await sendWhatsAppOtp(canonicalPhone, rawOtp);
      if (waResult.success) {
        deliverySuccess = true;
      } else {
        console.warn(`[AUTH-OTP] WhatsApp dispatch failed for ${canonicalPhone}. Falling back to SMS:`, waResult.error);
        // Automatic fallback to SMS
        const smsResult = await sendSmsOtp(canonicalPhone, rawOtp);
        if (smsResult.success) {
          deliverySuccess = true;
          actualChannel = "sms";
          fallbackUsed = true;
          // Update channel in database record
          if (verificationRecordId) {
            await query(
              `UPDATE public.otp_verifications SET channel = 'sms' WHERE id = $1;`,
              [verificationRecordId]
            );
          }
        } else {
          console.error(`[AUTH-OTP] Both WhatsApp and SMS fallback failed for ${canonicalPhone}:`, smsResult.error);
        }
      }
    } else {
      // Explicitly requested SMS channel
      const smsResult = await sendSmsOtp(canonicalPhone, rawOtp);
      deliverySuccess = smsResult.success;
    }

    if (!deliverySuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to deliver verification code. Please check your network or try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: actualChannel === "whatsapp"
        ? `Verification code sent to WhatsApp (${normalized.formatted})`
        : `Verification code sent via SMS (${normalized.formatted})`,
      channel: actualChannel,
      fallbackUsed,
      expiresIn: 300,
      cooldown: 60,
    });
  } catch (error: any) {
    console.error("[AUTH-OTP] send-otp handler error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Unable to process verification request" },
      { status: 500 }
    );
  }
}
