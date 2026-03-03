export const isRTL = (lng: string) => lng === "ar";

export function applyLangAndDir(lng: string) {
  const dir = isRTL(lng) ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;

  // css/tailwind help
  document.documentElement.classList.toggle("rtl", dir === "rtl");
}