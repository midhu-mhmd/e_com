import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

type Lang = "en" | "ar" | "zh";

/**
 * Custom hook for switching languages (EN / AR / ZH)
 * - Sets HTML lang + dir
 * - Keeps flicker low by temporarily disabling body transition
 * - Intended to be used ONLY on user-side layout
 */
const useLanguageToggle = () => {
  const { i18n } = useTranslation();

  const setHtmlAttributes = useCallback((lang: Lang) => {
    const html = document.documentElement;
    const newDir = lang === "ar" ? "rtl" : "ltr";

    // prevent unnecessary changes
    const currentDir = html.getAttribute("dir");
    const currentLang = html.getAttribute("lang");

    if (currentDir !== newDir || currentLang !== lang) {
      document.body.style.transition = "none";

      html.setAttribute("lang", lang);
      html.setAttribute("dir", newDir);

      // optional class for RTL styling helpers
      html.classList.toggle("rtl", newDir === "rtl");

      requestAnimationFrame(() => {
        document.body.style.transition = "";
      });
    }
  }, []);

  useEffect(() => {
    const lang = (i18n.language as Lang) || "en";
    setHtmlAttributes(lang);
  }, [i18n.language, setHtmlAttributes]);

  const setLanguage = useCallback(
    (lang: Lang) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  // optional “toggle” (EN <-> AR), Chinese separate selection
  const toggleLanguage = useCallback(() => {
    const current = (i18n.language as Lang) || "en";
    const next = current === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  }, [i18n]);

  const currentLanguage = ((i18n.language as Lang) || "en");

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    isArabic: currentLanguage === "ar",
    isEnglish: currentLanguage === "en",
    isChinese: currentLanguage === "zh",
  };
};

export default useLanguageToggle;