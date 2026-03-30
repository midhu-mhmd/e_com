const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").trim();
const hasAbsoluteApiBase = /^https?:\/\//i.test(rawApiBaseUrl);

export const API_BASE_URL =
  hasAbsoluteApiBase
    ? rawApiBaseUrl.replace(/\/+$/, "")
    : typeof window !== "undefined"
      ? new URL(rawApiBaseUrl, window.location.origin).toString().replace(/\/+$/, "")
      : rawApiBaseUrl;
export const FEATURE_ORDERS_ANALYTICS =
  String(import.meta.env.VITE_FEATURE_ORDERS_ANALYTICS || "false") === "true";
