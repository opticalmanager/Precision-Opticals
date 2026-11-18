import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateTrackingId(): string {
  const prefix = "PO";
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomDigits}`;
}

export function getEstimatedDeliveryDate(daysToAdd: number = 4): string {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatWord(token: string): string {
  if (!token) return "";
  // Roman numerals: I, II, III, IV, V, VI, etc.
  if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(token)) return token.toUpperCase();
  // Alphanumeric model numbers/codes e.g. 4016V, 0RX, 7027I, FT5557-B, 601/9A, ES-301
  if (/[0-9]/.test(token) && /[a-zA-Z\/-]/.test(token)) return token.toUpperCase();
  // Pure digits e.g. 4016, 4011, 30
  if (/^[0-9]+$/.test(token)) return token;
  // Specific optical abbreviations / tech terms
  if (/^(uv|uv400|rx|rb|g15|gen|hd|ar|tr|sku|ed|pro|max)$/i.test(token)) return token.toUpperCase();
  // Hyphenated words without digits e.g. BLUE-SHIELD -> Blue-Shield
  if (token.includes("-")) {
    return token.split("-").map(formatWord).join("-");
  }
  // Standard word -> Clean Title Case
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

/**
 * Formats a raw product name (often all-caps scraped text) into an elegant,
 * luxury-standard Title Case string, preserving alphanumeric model codes,
 * Roman numerals, and removing redundant leading brand names when brand is shown separately.
 */
export function formatProductName(rawName?: string, brand?: string): string {
  if (!rawName) return "";
  let name = rawName.replace(/\s+/g, " ").trim();

  if (brand) {
    const words = brand.trim().split(/[-\s]+/).filter(Boolean);
    if (words.length > 0) {
      const pattern = "^" + words.map(escapeRegex).join("[- ]+") + " *";
      const regex = new RegExp(pattern, "i");
      const stripped = name.replace(regex, "").trim();
      // Only adopt stripped if it has non-digit letters and is at least 2 chars
      if (stripped && !/^[0-9]+$/.test(stripped) && stripped.length >= 2) {
        name = stripped;
      }
    }
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map(formatWord)
    .join(" ");
}

