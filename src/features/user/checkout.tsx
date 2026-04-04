import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useDeliveryEstimation } from "../../hooks/useDeliveryEstimation";
import { selectCartItems, selectCartTotal, clearCart } from "../admin/cart/cartSlice";
import { ordersApi, type CheckoutSummaryResponse } from "../admin/orders/ordersApi";
import { customersApi, type AddressDto } from "../admin/customers/customersApi";
import {
  MapPin, CreditCard, Truck, ArrowLeft, Loader2,
  Calendar, Clock, MessageSquare, Plus, Home, Briefcase, ChevronDown, Info, Check, Tag, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ui/Toast";
import { MdDeliveryDining } from "react-icons/md";
import useLanguageToggle from "../../hooks/useLanguageToggle";
import { profileApi } from "./profileApi";
import { setUser } from "../auth/authSlice";
import { api, tokenManager } from "../../services/api";

/* ─── Delivery Slot Options ─── */
const DELIVERY_SLOTS = [
  { value: "9AM-12PM", key: "delivery.slots.morning" },
  { value: "2PM-5PM", key: "delivery.slots.afternoon" },
  { value: "6PM-9PM", key: "delivery.slots.evening" },
];

// ✅ Updated Tip Presets
const TIP_PRESETS = [0, 1, 3, 5];

const ADDRESS_TYPES = [
  { value: "home", key: "addressTypes.home" },
  { value: "work", key: "addressTypes.work" },
  { value: "other", key: "addressTypes.other" },
];

const EMIRATES = [
  { value: "abu_dhabi", key: "emirates.abu_dhabi" },
  { value: "dubai", key: "emirates.dubai" },
  { value: "sharjah", key: "emirates.sharjah" },
  { value: "ajman", key: "emirates.ajman" },
  { value: "umm_al_quwain", key: "emirates.umm_al_quwain" },
  { value: "ras_al_khaimah", key: "emirates.ras_al_khaimah" },
  { value: "fujairah", key: "emirates.fujairah" },
];

type CouponFeedback = {
  type: "success" | "error";
  message: string;
};

type AvailableCoupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  badge?: string;
};

const parseAmount = (value?: string | number | null) => {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCouponCode = (value?: string | null) =>
  String(value ?? "").trim().toUpperCase();

const normalizeAvailableCoupon = (raw: any, index: number): AvailableCoupon | null => {
  const code = normalizeCouponCode(raw?.coupon_code ?? raw?.code ?? raw?.promo_code);

  if (!code) return null;

  const discountType = String(raw?.discount_type ?? "").toLowerCase();
  const percentage = raw?.discount_percentage ?? raw?.percentage;
  const fixedAmount = raw?.discount_amount ?? raw?.amount ?? raw?.discount_value;

  let badge = "";
  if (discountType === "percentage" && percentage !== undefined && percentage !== null) {
    badge = `${percentage}% OFF`;
  } else if (fixedAmount !== undefined && fixedAmount !== null && String(fixedAmount).trim() !== "") {
    badge = `AED ${parseAmount(fixedAmount).toFixed(0)} OFF`;
  }

  return {
    id: String(raw?.id ?? `${code}-${index}`),
    code,
    title: raw?.title ?? raw?.name ?? code,
    description:
      raw?.description ??
      raw?.message ??
      raw?.short_description ??
      (badge ? `Apply ${badge.toLowerCase()} to this order.` : "Available coupon"),
    badge: badge || undefined,
  };
};

const getApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
    return String(data.non_field_errors[0]);
  }

  if (data && typeof data === "object") {
    const firstFieldError = Object.values(data).find(
      (value) =>
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === "string" && value.trim())
    );

    if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
      return String(firstFieldError[0]);
    }

    if (typeof firstFieldError === "string" && firstFieldError.trim()) {
      return firstFieldError;
    }
  }

  return fallback;
};

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation("checkout");
  const { isArabic } = useLanguageToggle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const { user } = useAppSelector((s: any) => s.auth);

  // ─── Delivery Estimation from Tiers ───
  const { estimation, loading: estimationLoading } = useDeliveryEstimation();

  // ─── State ───
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState<string>("");
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<CouponFeedback | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryUnsupported, setSummaryUnsupported] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ZIINA">("ZIINA");

  const [submitting, setSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // ─── Phone Verification Gate ───
  const phoneVerified: boolean = Boolean(user?.is_phone_verified ?? user?.profile?.is_phone_verified);
  const existingPhone: string = user?.phone_number || "";
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState<"input" | "otp">("input");
  const [verifyCountry, setVerifyCountry] = useState("+971");
  const [verifyPhone, setVerifyPhone] = useState(existingPhone.replace(/[^\d]/g, "").replace(/^(\+971)/, "") || "");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Add address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "home", full_name: "", phone_number: "", building_name: "",
    flat_villa_number: "", street_address: "", area: "", city: "",
    emirate: "", country: "AE", address_type: "home"
  });
  const [addrCountryCode, setAddrCountryCode] = useState("+971");
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const addrDropdownRef = useRef<HTMLDivElement>(null);
  const addressCountries = [
    { code: "+971", flag: "https://flagcdn.com/w40/ae.png", name: "UAE" },
    { code: "+91", flag: "https://flagcdn.com/w40/in.png", name: "India" },
    { code: "+86", flag: "https://flagcdn.com/w40/cn.png", name: "China" },
  ];
  const getPhoneRequirements = (code: string) => {
    switch (code) {
      case "+971": return { length: 9, pattern: /^5/, name: "UAE" };
      case "+91": return { length: 10, pattern: /^[6-9]/, name: "India" };
      case "+86": return { length: 11, pattern: /^1/, name: "China" };
      default: return { length: 10, pattern: null, name: "Phone" };
    }
  };
  const verifyReq = getPhoneRequirements(verifyCountry);
  const isVerifyPhoneValid = (() => {
    const digits = verifyPhone.replace(/[^\d]/g, "");
    if (digits.length !== verifyReq.length) return false;
    return verifyReq.pattern ? verifyReq.pattern.test(digits) : true;
  })();
  const allowedUaeCities = EMIRATES.map(e => t(e.key).toLowerCase());
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addrDropdownRef.current && !addrDropdownRef.current.contains(e.target as Node)) {
        setAddrDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!addressForm.full_name || addressForm.full_name.trim().length < 3) {
      errors.full_name = "Full name must be at least 3 characters";
    }
    const req = getPhoneRequirements(addrCountryCode);
    const digitsOnly = (addressForm.phone_number || "").replace(/[^\d]/g, "");
    if (digitsOnly.length !== req.length || (req.pattern && !req.pattern.test(digitsOnly))) {
      errors.phone_number = `${req.name}: ${req.length} digits${req.pattern ? ", specific starting digits required" : ""}`;
    }
    if (addrCountryCode === "+971" && addressForm.city) {
      const c = addressForm.city.trim().toLowerCase();
      if (!allowedUaeCities.includes(c)) {
        errors.city = "Select a valid UAE city/emirate";
      }
    }
    if (!addressForm.street_address) errors.street_address = "Street address is required";
    if (!addressForm.area) errors.area = "Area is required";
    if (!addressForm.city) errors.city = "City is required";
    if (!addressForm.emirate) errors.emirate = "Please select an emirate";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Fetch Addresses ───
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await customersApi.listAddresses();
        const list = Array.isArray(data) ? data : data.results || [];
        setAddresses(list);
        const defaultAddr = list.find((a: AddressDto) => a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (list.length > 0) setSelectedAddressId(list[0].id);
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  // ─── Computed ───
  useEffect(() => {
    let isMounted = true;

    const loadAvailableCoupons = async () => {
      setLoadingCoupons(true);
      setCouponsError(null);

      try {
        const response = await api.get("/marketing/coupons/");
        const rawCoupons = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];

        const normalizedCoupons = rawCoupons
          .filter((coupon: any) => {
            // Only show active coupons
            if (coupon.is_active !== true) return false;

            // Only show coupons that haven't reached their usage limit
            if (
              coupon.usage_limit !== null &&
              coupon.usage_limit !== undefined &&
              coupon.used_count >= coupon.usage_limit
            ) {
              return false;
            }

            return true;
          })
          .map((coupon: any, index: number) => normalizeAvailableCoupon(coupon, index))
          .filter(Boolean) as AvailableCoupon[];

        if (isMounted) {
          setAvailableCoupons(normalizedCoupons);
        }
      } catch (error: any) {
        if (isMounted) {
          setCouponsError(
            getApiErrorMessage(error, "Unable to load available coupons right now.")
          );
        }
      } finally {
        if (isMounted) {
          setLoadingCoupons(false);
        }
      }
    };

    void loadAvailableCoupons();

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveTip = isCustomTip ? (parseFloat(customTip) || 0) : tipAmount;
  const summarySubtotal = checkoutSummary ? parseAmount(checkoutSummary.cart_total_before_discount) : cartTotal;
  const summaryDiscount = checkoutSummary ? parseAmount(checkoutSummary.discount_amount) : 0;
  const summaryAfterDiscount = checkoutSummary ? parseAmount(checkoutSummary.cart_total_after_discount) : cartTotal;
  const summaryDeliveryCharge = checkoutSummary ? parseAmount(checkoutSummary.delivery_charge) : null;
  const summaryTip = checkoutSummary ? parseAmount(checkoutSummary.tip_amount) : effectiveTip;
  const finalTotal = checkoutSummary
    ? parseAmount(checkoutSummary.final_total)
    : Number((cartTotal + effectiveTip).toFixed(2));

  // Min date = earliest possible delivery (based on tier estimation)
  const deliveryDaysNeeded = estimation?.max_delivery_days || 1;
  const minDate = new Date(Date.now() + deliveryDaysNeeded * 86400000).toISOString().split("T")[0];

  // ─── Add Address Handler ───
  const fetchCheckoutSummary = async () => {
    if (summaryUnsupported) {
      return "unsupported" as const;
    }

    if (!selectedAddressId) {
      setCheckoutSummary(null);
      setSummaryError(null);
      return null;
    }

    if (!deliveryDate) {
      setCheckoutSummary(null);
      setSummaryError(null);
      return null;
    }

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const summary = await ordersApi.checkoutSummary({
        address_id: selectedAddressId,
        coupon_code: appliedCouponCode || undefined,
        tip_amount: effectiveTip > 0 ? effectiveTip : undefined,
        preferred_delivery_date: deliveryDate || undefined,
        preferred_delivery_slot: deliverySlot || undefined,
      });

      setCheckoutSummary(summary);
      setSummaryUnsupported(false);

      if (summary.coupon_message) {
        setCouponFeedback({
          type: parseAmount(summary.discount_amount) > 0 ? "success" : "error",
          message: summary.coupon_message,
        });
      }

      return summary;
    } catch (error: any) {
      if (error?.response?.status === 405) {
        setCheckoutSummary(null);
        setSummaryUnsupported(true);
        setSummaryError(
          "This server does not support checkout summary yet. You can still continue to place the order."
        );
        return "unsupported" as const;
      }

      const message = getApiErrorMessage(
        error,
        "Unable to load the checkout summary right now."
      );

      setSummaryError(message);
      return null;
    } finally {
      setSummaryLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedAddressId || !deliveryDate) {
      setCheckoutSummary(null);
      setSummaryError(null);
      return;
    }

    if (summaryUnsupported) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchCheckoutSummary();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [selectedAddressId, appliedCouponCode, effectiveTip, deliveryDate, deliverySlot, summaryUnsupported]);

  const handleApplyCoupon = async (couponCode = couponInput) => {
    const normalizedCoupon = String(couponCode ?? "").trim().toUpperCase();

    if (!normalizedCoupon) {
      setCouponFeedback({
        type: "error",
        message: "Enter a coupon code to apply it.",
      });
      return;
    }

    setValidatingCoupon(true);
    setCouponFeedback(null);
    setCouponInput(normalizedCoupon);

    try {
      const result = await ordersApi.validateCoupon({
        coupon_code: normalizedCoupon,
        cart_total: cartTotal,
      });

      if (result.success) {
        const resolvedCode = result.coupon_code || normalizedCoupon;
        setAppliedCouponCode(resolvedCode);
        setCouponInput(resolvedCode);
        setCouponFeedback({
          type: "success",
          message: result.message,
        });
      } else {
        setAppliedCouponCode("");
        setCouponFeedback({
          type: "error",
          message: result.message,
        });
      }
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        "Unable to validate this coupon right now."
      );

      setAppliedCouponCode("");
      setCouponFeedback({
        type: "error",
        message,
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCouponCode("");
    setCouponFeedback(null);
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setSavingAddress(true);
    try {
      const newAddr = await customersApi.createAddress({
        ...addressForm,
        phone_number: `${addrCountryCode}${(addressForm.phone_number || "").replace(/[^\d]/g, "").replace(/^0+/, "")}`
      } as any);
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      setAddressForm({
        label: "home", full_name: "", phone_number: "", building_name: "",
        flat_villa_number: "", street_address: "", area: "", city: "",
        emirate: "", country: "AE", address_type: "home"
      });
      setAddressErrors({});
    } catch (err: any) {
      console.error("Failed to save address", err);
      const serverMsg = err?.response?.data?.error || "Failed to save address. Please try again.";
      toast.show(serverMsg, "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // ─── Submit Checkout ───
  const handlePlaceOrder = async () => {
    setAttemptedSubmit(true);

    if (!phoneVerified) {
      // Open verification modal if not verified
      setVerifyOpen(true);
      setVerifyStep("input");
      return;
    }

    if (!selectedAddressId) {
      toast.show(t("alerts.selectAddress"), "error");
      return;
    }

    if (!deliveryDate) {
      toast.show("Please select a preferred delivery date", "error");
      return;
    }

    setSubmitting(true);
    try {
      const latestSummary = await fetchCheckoutSummary();

      if (latestSummary === null) {
        toast.show(
          summaryError || "Unable to confirm your final total right now. Please try again.",
          "error"
        );
        return;
      }

      if (
        latestSummary !== "unsupported" &&
        appliedCouponCode &&
        latestSummary.coupon_message &&
        parseAmount(latestSummary.discount_amount) <= 0
      ) {
        toast.show(latestSummary.coupon_message, "error");
        return;
      }

      const payload: any = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        preferred_delivery_date: deliveryDate,
      };
      if (deliverySlot) payload.preferred_delivery_slot = deliverySlot;
      if (deliveryNotes.trim()) payload.delivery_notes = deliveryNotes.trim();
      if (effectiveTip > 0) payload.tip_amount = effectiveTip;
      if (appliedCouponCode) payload.coupon_code = appliedCouponCode;

      const res = await ordersApi.checkout(payload);

      if (res.payment_method === "ZIINA" && res.payment_url) {
        // Store order_id so payment result pages can always access it
        sessionStorage.setItem("pending_order_id", String(res.order_id));
        // Redirect to Ziina payment gateway
        window.location.href = res.payment_url;
        return;
      }

      // COD success
      dispatch(clearCart());
      navigate(`/payment/success?order_id=${res.order_id}`);
    } catch (error: any) {
      const msg = error?.response?.data?.error || t("alerts.placeOrderFailed");
      toast.show(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Empty Cart ───
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Truck size={36} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold">{t("emptyCart.title")}</p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-2.5 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition-colors"
        >
          {t("emptyCart.cta")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/cart")} className="text-slate-400 hover:text-cyan-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-900">{t("header.title")}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* ═══ Left Column - Form ═══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ──── 1. Address Selection ──── */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 rounded-xl text-cyan-600">
                <MapPin size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900">{t("address.title")}</h2>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-slate-400 text-sm">{t("address.noAddresses")}</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors"
                >
                  <Plus size={16} /> {t("address.addNew")}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative ${isArabic ? 'text-right' : 'text-left'} p-4 rounded-2xl border-2 transition-all duration-200 ${selectedAddressId === addr.id
                        ? "border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20 shadow-md"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                        }`}
                    >
                      {/* Label badge */}
                      <div className="flex items-center gap-2 mb-2">
                        {addr.label?.toLowerCase() === "home" ? (
                          <Home size={14} className="text-cyan-600" />
                        ) : (
                          <Briefcase size={14} className="text-cyan-600" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                          {addr.label || "Address"}
                        </span>
                        {selectedAddressId === addr.id && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white">
                            <Check size={12} />
                          </span>
                        )}
                        {addr.is_default && (
                          <span className={`${isArabic ? 'mr-auto' : 'ml-auto'} text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md`}>
                            {t("address.default")}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-900 mb-0.5">{addr.full_name}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {[addr.flat_villa_number, addr.building_name, addr.street_address]
                          .filter(Boolean).join(", ")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {[addr.area, addr.city, addr.emirate].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{addr.phone_number}</p>

                      {/* Selected state is indicated by border + ring; no extra badge to avoid overlap with Default */}
                    </button>
                  ))}
                </div>

                {/* Add new address toggle */}
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors mt-2"
                  >
                    <Plus size={16} /> {t("address.addNew")}
                  </button>
                )}
              </>
            )}

            {/* ── Add Address Form ── */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border border-slate-100 rounded-2xl p-5 space-y-4 mt-3 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Address Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address Type</label>
                        <div className="relative">
                          <select
                            value={addressForm.address_type}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, address_type: e.target.value, label: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                          >
                            {ADDRESS_TYPES.map((at) => (
                              <option key={at.value} value={at.value}>{t(at.key)}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                        </div>
                      </div>

                      {/* Text fields */}
                      {([
                        ["full_name", t("address.fields.fullName.label"), t("address.fields.fullName.placeholder")],
                        ["building_name", t("address.fields.building.label"), t("address.fields.building.placeholder")],
                        ["flat_villa_number", t("address.fields.flat.label"), t("address.fields.flat.placeholder")],
                        ["street_address", t("address.fields.street.label"), t("address.fields.street.placeholder")],
                        ["area", t("address.fields.area.label"), t("address.fields.area.placeholder")],
                        ["city", t("address.fields.city.label"), t("address.fields.city.placeholder")],
                      ] as [string, string, string][]).map(([key, label, placeholder]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                          <input
                            value={(addressForm as any)[key]}
                            onChange={(e) => {
                              setAddressForm((prev) => ({ ...prev, [key]: e.target.value }));
                              if (addressErrors[key]) {
                                setAddressErrors(prev => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                });
                              }
                            }}
                            placeholder={placeholder}
                            className={`w-full px-3.5 py-2.5 bg-white border ${addressErrors[key] ? "border-rose-400 focus:ring-rose-500/30" : "border-slate-200 focus:ring-cyan-500/30"} rounded-xl text-sm focus:ring-2 focus:border-cyan-400 outline-none transition-all`}
                          />
                          {addressErrors[key] && (
                            <p className="text-[10px] text-rose-500 font-medium px-1">{addressErrors[key]}</p>
                          )}
                        </div>
                      ))}
                      {/* Phone with country flag selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                        <div className="flex gap-2">
                          <div className="relative" ref={addrDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setAddrDropdownOpen(!addrDropdownOpen)}
                              className="h-[42px] px-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-sm hover:bg-slate-50"
                            >
                              <img src={(addressCountries.find(c => c.code === addrCountryCode) || addressCountries[0]).flag} alt="flag" className="w-5 h-[14px] object-cover rounded-sm" />
                              <span className="text-xs font-medium text-slate-700">{addrCountryCode}</span>
                              <ChevronDown size={12} className={`text-slate-400 transition-transform ${addrDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {addrDropdownOpen && (
                          <div className={`absolute top-full ${isArabic ? 'right-0' : 'left-0'} mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50`}>
                                {addressCountries.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => { setAddrCountryCode(c.code); setAddrDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-cyan-50 ${c.code === addrCountryCode ? "bg-cyan-50 text-cyan-600" : "text-slate-700"}`}
                                  >
                                    <img src={c.flag} alt={c.name} className="w-5 h-[14px] object-cover rounded-sm" />
                                    <span className="font-medium">{c.name}</span>
                                    <span className="ms-auto text-slate-400">{c.code}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            value={addressForm.phone_number}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^\d]/g, "");
                              setAddressForm((prev) => ({ ...prev, phone_number: v }));
                              if (addressErrors.phone_number) {
                                setAddressErrors(prev => {
                                  const next = { ...prev };
                                  delete next.phone_number;
                                  return next;
                                });
                              }
                            }}
                            placeholder={`${getPhoneRequirements(addrCountryCode).length} digits`}
                            maxLength={getPhoneRequirements(addrCountryCode).length}
                            className={`w-full px-3.5 py-2.5 bg-white border ${addressErrors.phone_number ? "border-rose-400 focus:ring-rose-500/30" : "border-slate-200 focus:ring-cyan-500/30"} rounded-xl text-sm focus:ring-2 focus:border-cyan-400 outline-none transition-all`}
                            inputMode="tel"
                          />
                        </div>
                        {addressErrors.phone_number && (
                          <p className="text-[10px] text-rose-500 font-medium px-1">{addressErrors.phone_number}</p>
                        )}
                      </div>

                      {/* Emirate Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emirate</label>
                        <div className="relative">
                          <select
                            value={addressForm.emirate}
                            onChange={(e) => {
                              setAddressForm((prev) => ({ ...prev, emirate: e.target.value }));
                              if (addressErrors.emirate) {
                                setAddressErrors(prev => {
                                  const next = { ...prev };
                                  delete next.emirate;
                                  return next;
                                });
                              }
                            }}
                            className={`w-full px-3.5 py-2.5 bg-white border ${addressErrors.emirate ? "border-rose-400 focus:ring-rose-500/30" : "border-slate-200 focus:ring-cyan-500/30"} rounded-xl text-sm appearance-none focus:ring-2 focus:border-cyan-400 outline-none transition-all`}
                          >
                            <option value="">{t("address.fields.emirate.placeholder")}</option>
                            {EMIRATES.map((em) => (
                              <option key={em.value} value={em.value}>{t(em.key)}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {addressErrors.emirate && (
                          <p className="text-[10px] text-rose-500 font-medium px-1">{addressErrors.emirate}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {savingAddress && <Loader2 size={14} className="animate-spin" />}
                        {savingAddress ? t("address.adding") : t("address.addNew")}
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──── 2. Delivery Preferences ──── */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <Calendar size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900">{t("delivery.title")}</h2>
            </div>

            {/* Delivery Tier Info */}
            {estimationLoading ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Loader2 className="animate-spin text-blue-600" size={16} />
                <p className="text-xs text-blue-700 font-medium">Loading delivery estimates...</p>
              </div>
            ) : estimation ? (
              <div className="space-y-3">
                {/* Estimated Delivery Days Banner */}
                <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-amber-600" />
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Estimated Delivery Window
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {estimation.max_delivery_days} {estimation.max_delivery_days === 1 ? "day" : "days"} delivery time
                  </p>
                  <p className="text-xs text-amber-700">
                    Minimum delivery date is {minDate === new Date(Date.now() + 86400000).toISOString().split("T")[0] ? "tomorrow" : `in ${deliveryDaysNeeded} days`}
                  </p>
                </div>

                {/* Items Breakdown */}
                {estimation.items_breakdown && estimation.items_breakdown.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Products Delivery Times</p>
                    <div className="space-y-1.5">
                      {estimation.items_breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium truncate flex-1">{item.product_name || `Product ${idx + 1}`}</span>
                          <span className={`text-slate-500 ${isArabic ? 'mr-2' : 'ml-2'}`}>Qty: {item.quantity}</span>
                          <span className={`${isArabic ? 'mr-2' : 'ml-2'} px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold`}>
                            {item.delivery_days}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} /> {t("delivery.date")}
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  min={minDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400">Earliest: {minDate}</p>
              </div>

              {/* Slot */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> {t("delivery.slot")}
                </label>
                <div className="relative">
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                  >
                    <option value="">{t("delivery.slot")}</option>
                    {DELIVERY_SLOTS.map((s) => (
                      <option key={s.value} value={s.value}>{t(s.key)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={12} /> {t("delivery.notes")}
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={t("delivery.notesPlaceholder")}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all resize-none"
              />
            </div>

            {/* Tier Info Helper */}
            {estimation && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex gap-2">
                <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Delivery time based on <span className="font-bold">order quantity</span>. Larger orders may take longer due to fulfillment requirements.
                </p>
              </div>
            )}
          </section>

          {/* ──── 3. Tip ──── */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600 shadow-inner">
                <MdDeliveryDining size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-900">{t("tip.title")}</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {TIP_PRESETS.map((val) => (
                <button
                  key={val}
                  onClick={() => { setTipAmount(val); setIsCustomTip(false); setCustomTip(""); }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${!isCustomTip && tipAmount === val
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {val === 0 ? "No Tip" : `AED ${val}`}
                </button>
              ))}
              <button
                onClick={() => { setIsCustomTip(true); setTipAmount(0); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isCustomTip
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {t("tip.custom")}
              </button>
            </div>

            <AnimatePresence>
              {isCustomTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-500">AED</span>
                    {/* ✅ Updated Input with hide-arrows class and + Button */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all overflow-hidden">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        placeholder="0.0"
                        className="w-24 px-3 py-2.5 bg-transparent text-sm font-bold outline-none text-center hide-arrows"
                      />
                      <button
                        onClick={() => {
                          const currentVal = parseFloat(customTip) || 0;
                          setCustomTip((currentVal + 0.5).toString());
                        }}
                        className="h-full px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border-l border-slate-200 transition-colors flex items-center justify-center"
                        title="Add 0.5 AED"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ──── 4. Payment Method ──── */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <CreditCard size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900">{t("payment.title")}</h2>
            </div>

            <div className="space-y-3">
              {/* ZIINA */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "ZIINA"
                  ? "border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20"
                  : "border-slate-100 hover:border-slate-200"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ZIINA"
                  checked={paymentMethod === "ZIINA"}
                  onChange={() => setPaymentMethod("ZIINA")}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{t("payment.ziina.title")}</p>
                  <p className="text-xs text-slate-500">{t("payment.ziina.subtitle")}</p>
                </div>
                <CreditCard size={20} className="text-slate-400" />
              </label>

              {/* COD - Disabled / Coming Soon */}
              <div
                className="relative flex items-center gap-4 p-4 border-2 rounded-2xl border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed select-none"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  disabled
                  className="w-5 h-5 text-slate-300"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-400">{t("payment.cod.title")}</p>
                  <p className="text-xs text-slate-400">{t("payment.cod.subtitle")}</p>
                </div>
                <Truck size={20} className="text-slate-300" />
                <span className="absolute top-2 right-3 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ═══ Right Column - Order Summary ═══ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">{t("summary.title")}</h2>
              {summaryLoading && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700">
                  <Loader2 size={14} className="animate-spin" />
                  Updating
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-xl text-cyan-700">
                  <Tag size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {t("coupon.title", { defaultValue: "Coupon Code" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("coupon.subtitle", { defaultValue: "Validate your code before placing the order." })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleApplyCoupon();
                    }
                  }}
                  placeholder={t("coupon.placeholder", { defaultValue: "Enter coupon code" })}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm uppercase tracking-wide focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={appliedCouponCode ? handleRemoveCoupon : () => void handleApplyCoupon()}
                  disabled={validatingCoupon}
                  className={`px-4 py-3 rounded-xl text-sm font-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${appliedCouponCode
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-cyan-600 text-white hover:bg-cyan-700"
                    }`}
                >
                  {validatingCoupon ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : appliedCouponCode ? (
                    t("coupon.remove", { defaultValue: "Remove" })
                  ) : (
                    t("coupon.apply", { defaultValue: "Apply" })
                  )}
                </button>
              </div>

              {appliedCouponCode && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <span className="text-xs font-bold text-emerald-700">
                    {t("coupon.applied", {
                      defaultValue: "Applied coupon: {{code}}",
                      code: appliedCouponCode,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-emerald-900 transition-colors"
                    aria-label={t("coupon.remove", { defaultValue: "Remove coupon" })}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {couponFeedback && (
                <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${couponFeedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                  {couponFeedback.message}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t("coupon.availableTitle", { defaultValue: "Available Coupons" })}
                  </p>
                  {availableCoupons.length > 0 && (
                    <span className="text-[11px] font-bold text-cyan-700">{availableCoupons.length}</span>
                  )}
                </div>

                {loadingCoupons && (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                    <Loader2 size={14} className="animate-spin text-cyan-600" />
                    {t("coupon.loading", { defaultValue: "Loading available coupons..." })}
                  </div>
                )}

                {!loadingCoupons && couponsError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                    {couponsError}
                  </div>
                )}

                {!loadingCoupons && !couponsError && availableCoupons.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                    {t("coupon.empty", { defaultValue: "No coupons are available right now." })}
                  </div>
                )}

                {!loadingCoupons && availableCoupons.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableCoupons.map((coupon) => {
                      const isApplied = normalizeCouponCode(appliedCouponCode) === coupon.code;

                      return (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => void handleApplyCoupon(coupon.code)}
                          disabled={validatingCoupon}
                          className={`w-full text-left rounded-2xl border px-3 py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isApplied
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900">{coupon.code}</p>
                              {coupon.title !== coupon.code && (
                                <p className="mt-0.5 text-xs font-semibold text-slate-700">{coupon.title}</p>
                              )}
                              <p className="mt-1 text-xs text-slate-500">{coupon.description}</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              {coupon.badge && (
                                <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-700">
                                  {coupon.badge}
                                </span>
                              )}
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${isApplied
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600"
                                }`}>
                                {isApplied
                                  ? t("coupon.appliedShort", { defaultValue: "Applied" })
                                  : t("coupon.applyShort", { defaultValue: "Tap to apply" })}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.image || ""} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {t("summary.qtyPrice", { qty: item.quantity, price: item.finalPrice })}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-slate-900 shrink-0">
                    {t("currency.aed", { value: (item.finalPrice * item.quantity).toFixed(2) })}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("summary.subtotal")}</span>
                <span className="font-bold text-slate-900">
                  {t("currency.aed", { value: summarySubtotal.toFixed(2) })}
                </span>
              </div>

              {summaryDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">
                    {t("summary.discount", { defaultValue: "Discount" })}
                    {checkoutSummary?.discount_code ? ` (${checkoutSummary.discount_code})` : ""}
                  </span>
                  <span className="font-bold text-emerald-600">
                    -{t("currency.aed", { value: summaryDiscount.toFixed(2) })}
                  </span>
                </div>
              )}

              {summaryDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t("summary.afterDiscount", { defaultValue: "After Discount" })}
                  </span>
                  <span className="font-bold text-slate-900">
                    {t("currency.aed", { value: summaryAfterDiscount.toFixed(2) })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("summary.shipping")}</span>
                {summaryDeliveryCharge === null ? (
                  <span className="font-bold text-slate-500">
                    {t("summary.calculatedAtCheckout", { defaultValue: "Calculated at checkout" })}
                  </span>
                ) : (
                  <span className={`font-bold ${summaryDeliveryCharge === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                    {summaryDeliveryCharge === 0
                      ? t("summary.free")
                      : t("currency.aed", { value: summaryDeliveryCharge.toFixed(2) })}
                  </span>
                )}
              </div>

              {summaryDeliveryCharge === null && (
                <p className="text-xs text-slate-400">
                  {t("summary.deliveryRule", {
                    defaultValue: "Delivery is free for orders AED 40 or more after discount.",
                  })}
                </p>
              )}

              {summaryTip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("summary.tip")}</span>
                  <span className="font-bold text-rose-500">
                    {t("currency.aed", { value: summaryTip.toFixed(2) })}
                  </span>
                </div>
              )}

              {summaryError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {summaryError}
                </div>
              )}

              {!selectedAddressId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  {t("summary.selectAddressHint", {
                    defaultValue: "Select a delivery address to calculate the final delivery charge.",
                  })}
                </div>
              )}

              {selectedAddressId && !deliveryDate && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  {t("summary.selectDateHint", {
                    defaultValue: "Choose your delivery date to preview the final total and delivery charge.",
                  })}
                </div>
              )}

              <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-1">
                <span className="text-base font-bold text-slate-900">{t("summary.total")}</span>
                <span className="text-2xl font-black text-slate-900">
                  {t("currency.aed", { value: finalTotal.toFixed(2) })}
                </span>
              </div>
            </div>

            {/* Place Order */}
            <div className="space-y-2">
              {!phoneVerified && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex gap-2">
                  <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-800 font-medium">
                      Verify your phone number to place an order. This helps prevent fake orders.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setVerifyOpen(true); setVerifyStep("input"); }}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700"
                    >
                      Verify Phone
                    </button>
                  </div>
                </div>
              )}
              {attemptedSubmit && !deliveryDate && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex gap-2">
                  <Info size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">
                    Please select a preferred delivery date to proceed with your order.
                  </p>
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || summaryLoading || !selectedAddressId || !phoneVerified}
                className="w-full py-4 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-2xl font-black text-base hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t("actions.processing")}
                  </>
                ) : (
                  t("actions.placeOrder")
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Phone Verification Modal ─── */}
      <AnimatePresence>
        {verifyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setVerifyOpen(false)} />
            <div className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-5 z-10">
              <h3 className="text-sm font-black text-slate-900 mb-2">Verify Phone Number</h3>
              <p className="text-xs text-slate-500 mb-3">
                Only users with a verified phone can place orders.
              </p>
              {verifyError && (
                <div className="mb-3 p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
                  {verifyError}
                </div>
              )}
              {verifyStep === "input" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={verifyCountry}
                        onChange={(e) => { setVerifyCountry(e.target.value); }}
                        className="h-[42px] px-2 rounded-xl border border-slate-200 bg-white text-sm"
                      >
                        {addressCountries.map((c) => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={verifyPhone}
                      onChange={(e) => setVerifyPhone(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder={`${verifyReq.length} digits`}
                      maxLength={verifyReq.length}
                      className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                      inputMode="tel"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setVerifyError(null);
                      if (!isVerifyPhoneValid) {
                        setVerifyError(`${verifyReq.name}: ${verifyReq.length} digits${verifyReq.pattern ? ", specific starting digits required" : ""}`);
                        return;
                      }
                      try {
                        setSendingOtp(true);
                        const composed = `${verifyCountry}${verifyPhone.replace(/^0+/, "")}`;
                        const isChanged = composed !== (user?.phone_number || "");
                        if (user?.id && isChanged) {
                          await profileApi.updateProfile(user.id, { phone_number: composed } as any);
                          const me = await profileApi.getMe();
                          dispatch(setUser(me));
                        }
                        await profileApi.sendProfileOtp({
                          otp_type: "phone",
                          phone_number: composed,
                        } as any);
                        setVerifyStep("otp");
                      } catch (err: any) {
                        const apiErr = err?.response?.data;
                        const detail = apiErr?.detail || apiErr?.message || (typeof apiErr === "string" ? apiErr : "Failed to send OTP. Try again.");
                        setVerifyError(detail);
                      } finally {
                        setSendingOtp(false);
                      }
                    }}
                    disabled={sendingOtp || !isVerifyPhoneValid}
                    className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {sendingOtp ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enter OTP</label>
                  <input
                    value={verifyOtp}
                    onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="6 digits"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerifyStep("input")}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Edit Phone
                    </button>
                    <button
                      onClick={async () => {
                        setVerifyError(null);
                        if (verifyOtp.length < 6) {
                          setVerifyError("Enter the 6-digit OTP.");
                          return;
                        }
                        try {
                          setVerifyingOtp(true);
                          const composed = `${verifyCountry}${verifyPhone.replace(/^0+/, "")}`;
                          const res: any = await profileApi.verifyProfileOtp({
                            otp_type: "phone",
                            otp_code: verifyOtp,
                            phone_number: composed,
                          } as any);
                          const access = res?.access || res?.accessToken || res?.token;
                          if (access) tokenManager.set(access);
                          const me = res?.user || (await profileApi.getMe());
                          dispatch(setUser(me));
                          setVerifyOpen(false);
                          toast.show("Phone verified. You can now place your order.", "success");
                        } catch (err: any) {
                          const apiErr = err?.response?.data;
                          const detail = apiErr?.detail || apiErr?.message || (typeof apiErr === "string" ? apiErr : "OTP verification failed.");
                          setVerifyError(detail);
                        } finally {
                          setVerifyingOtp(false);
                        }
                      }}
                      disabled={verifyingOtp || verifyOtp.length < 6}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify & Continue"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ CSS to hide number input arrows */}
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
