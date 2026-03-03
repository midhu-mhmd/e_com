import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import arCommon from "./locales/ar/common.json";
import zhCommon from "./locales/zh/common.json";

import enHome from "./locales/en/home.json";
import arHome from "./locales/ar/home.json";
import zhHome from "./locales/zh/home.json";

import enProduct from "./locales/en/product.json";
import arProduct from "./locales/ar/product.json";
import zhProduct from "./locales/zh/product.json";

import enCart from "./locales/en/cart.json";
import arCart from "./locales/ar/cart.json";
import zhCart from "./locales/zh/cart.json";

import enCheckout from "./locales/en/checkout.json";
import arCheckout from "./locales/ar/checkout.json";
import zhCheckout from "./locales/zh/checkout.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ar", "zh"],

    resources: {
      en: { common: enCommon, home: enHome, product: enProduct, cart: enCart, checkout: enCheckout },
      ar: { common: arCommon, home: arHome, product: arProduct, cart: arCart, checkout: arCheckout },
      zh: { common: zhCommon, home: zhHome, product: zhProduct, cart: zhCart, checkout: zhCheckout },
    },

    ns: ["common", "home", "product", "cart", "checkout"],
    defaultNS: "common",
    interpolation: { escapeValue: false },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    // safe for nested keys
    keySeparator: ".",
  });

export default i18n;