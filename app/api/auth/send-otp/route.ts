import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, mode = "phone" } = body;

    if (mode === "phone") {
      const cleanPhone = (phone || "").replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid 10-digit mobile number" },
          { status: 400 }
        );
      }

      // Generate 4-digit verification code (demo mode uses 1234)
      const otpCode = "1234";
      console.log(`[AUTH-OTP] Generated SMS code ${otpCode} for phone +91 ${cleanPhone}`);

      return NextResponse.json({
        success: true,
        message: `Verification code sent to +91 ${cleanPhone}`,
        demoCode: "1234",
        expiresIn: 300,
      });
    } else {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address" },
          { status: 400 }
        );
      }

      const otpCode = "1234";
      console.log(`[AUTH-OTP] Generated Email code ${otpCode} for ${email}`);

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${email}`,
        demoCode: "1234",
        expiresIn: 300,
      });
    }
  } catch (error) {
    console.error("[AUTH-OTP] send-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process verification request" },
      { status: 500 }
    );
  }
}
