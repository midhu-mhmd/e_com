import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import arCommon from "./locales/ar/common.json";
import cnCommon from "./locales/cn/common.json";

import enHome from "./locales/en/home.json";
import arHome from "./locales/ar/home.json";
import cnHome from "./locales/cn/home.json";

import enProduct from "./locales/en/product.json";
import arProduct from "./locales/ar/product.json";
import cnProduct from "./locales/cn/product.json";

import enCart from "./locales/en/cart.json";
import arCart from "./locales/ar/cart.json";
import cnCart from "./locales/cn/cart.json";

import enCheckout from "./locales/en/checkout.json";
import arCheckout from "./locales/ar/checkout.json";
import cnCheckout from "./locales/cn/checkout.json";

import enProfile from "./locales/en/profile.json";
import arProfile from "./locales/ar/profile.json";
import cnProfile from "./locales/cn/profile.json";

import enSupport from "./locales/en/support.json";
import arSupport from "./locales/ar/support.json";
import cnSupport from "./locales/cn/support.json";

import enOrders from "./locales/en/orders.json";
import arOrders from "./locales/ar/orders.json";
import cnOrders from "./locales/cn/orders.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ar", "cn"],

    resources: {
      en: { common: enCommon, home: enHome, product: enProduct, cart: enCart, checkout: enCheckout, profile: enProfile, support: enSupport, orders: enOrders },
      ar: { common: arCommon, home: arHome, product: arProduct, cart: arCart, checkout: arCheckout, profile: arProfile, support: arSupport, orders: arOrders },
      cn: { common: cnCommon, home: cnHome, product: cnProduct, cart: cnCart, checkout: cnCheckout, profile: cnProfile, support: cnSupport, orders: cnOrders },
    },

    ns: ["common", "home", "product", "cart", "checkout", "profile", "support", "orders"],
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
