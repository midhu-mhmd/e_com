export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";
export const FEATURE_ORDERS_ANALYTICS =
  String(import.meta.env.VITE_FEATURE_ORDERS_ANALYTICS || "false") === "true";
