/**
 * Precision Optics - WACRM WhatsApp Integration Client
 * Delivers transactional authentication OTPs via the companion WACRM system
 * using the official Meta WhatsApp Cloud API and the approved 'wa_otp' template.
 */

import { getWhatsAppAuthConfig } from "./authSettings";

export interface SendWhatsAppOtpResult {
  success: boolean;
  messageId?: string;
  whatsappMessageId?: string;
  error?: string;
  isNetworkError?: boolean;
}

/**
 * Dispatches an authentication OTP via WACRM's public API endpoint:
 * POST /api/v1/messages
 * 
 * Injects the Meta-approved 'wa_otp' authentication template:
 * - Body: *{{1}}* is your verification code. For your security, do not share this code.
 * - One-Tap Button: Copy code (coupon_code / copy_code parameter)
 */
export async function sendWhatsAppOtp(e164Phone: string, otpCode: string): Promise<SendWhatsAppOtpResult> {
  const config = await getWhatsAppAuthConfig();

  if (!config.whatsappEnabled) {
    return {
      success: false,
      error: "WhatsApp OTP channel is currently disabled by administrator",
    };
  }

  const apiUrl = (config.wacrmApiUrl || "http://localhost:3000").replace(/\/+$/, "");
  const apiKey = config.wacrmApiKey?.trim();

  if (!apiKey) {
    return {
      success: false,
      error: "WACRM API Key is not configured. Please set in Admin Settings -> WhatsApp & Auth OTP.",
    };
  }

  const endpoint = `${apiUrl}/api/v1/messages`;

  const payload = {
    to: e164Phone,
    type: "template",
    template: {
      name: config.templateName || "wa_otp",
      language: config.templateLanguage || "en_US",
      params: {
        body: [otpCode],
        buttonParams: {
          "0": otpCode,
        },
      },
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second circuit-breaker

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP ${res.status} from WACRM`;
      console.warn(`[WACRM-CLIENT] Failed to send WhatsApp OTP to ${e164Phone}:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const messageData = data?.data;
    return {
      success: true,
      messageId: messageData?.message_id,
      whatsappMessageId: messageData?.whatsapp_message_id,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    const errorMsg = isTimeout ? "WACRM request timed out after 8s" : (err?.message || "Connection refused to WACRM");
    console.warn(`[WACRM-CLIENT] Network error reaching WACRM at ${apiUrl}:`, errorMsg);
    return {
      success: false,
      error: errorMsg,
      isNetworkError: true,
    };
  }
}
