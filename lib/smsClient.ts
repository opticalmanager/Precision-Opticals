/**
 * Precision Optics - SMS Fallback Gateway Client (MSG91 SendOTP)
 * Delivers transactional authentication OTPs via SMS when WhatsApp is unavailable
 * or when explicitly requested by the customer.
 */

import { getWhatsAppAuthConfig } from "./authSettings";
import { normalizePhoneNumber } from "./phoneUtils";

export interface SendSmsOtpResult {
  success: boolean;
  messageId?: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Dispatches an authentication OTP via MSG91 SendOTP API:
 * POST https://control.msg91.com/api/v5/otp
 */
export async function sendSmsOtp(phone: string, otpCode: string): Promise<SendSmsOtpResult> {
  const config = await getWhatsAppAuthConfig();

  if (!config.smsFallbackEnabled) {
    return {
      success: false,
      error: "SMS OTP fallback is currently disabled by administrator",
    };
  }

  const normalized = normalizePhoneNumber(phone);
  if (!normalized.isValid) {
    return {
      success: false,
      error: normalized.error || "Invalid mobile number for SMS",
    };
  }

  const authKey = config.msg91AuthKey?.trim() || process.env.MSG91_AUTH_KEY?.trim();
  const templateId = config.msg91TemplateId?.trim() || process.env.MSG91_TEMPLATE_ID?.trim();

  // If MSG91 credentials are not yet configured, provide a safe development simulation
  if (!authKey) {
    console.info(
      `[SMS-GATEWAY-DEV] MSG91_AUTH_KEY is not configured. Simulating SMS OTP delivery to ${normalized.e164}. Code: ${otpCode}`
    );
    return {
      success: true,
      messageId: `sim-msg91-${Date.now()}`,
      isSimulated: true,
    };
  }

  // International format without plus for MSG91: e.g. "919810012345"
  const msg91Mobile = `${normalized.countryCode}${normalized.national}`;

  const endpoint = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId || "")}&mobile=${msg91Mobile}&otp=${otpCode}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.type === "error")) {
      const errMsg = data?.message || `HTTP ${res.status} from MSG91`;
      console.warn(`[SMS-GATEWAY] MSG91 delivery failed for ${normalized.e164}:`, errMsg);
      return {
        success: false,
        error: errMsg,
      };
    }

    return {
      success: true,
      messageId: data?.request_id || `msg91-${Date.now()}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[SMS-GATEWAY] Network error connecting to MSG91:`, err?.message);
    return {
      success: false,
      error: err?.message || "Failed to connect to SMS gateway",
    };
  }
}
