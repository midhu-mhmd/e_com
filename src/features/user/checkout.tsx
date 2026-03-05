import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useDeliveryEstimation } from "../../hooks/useDeliveryEstimation";
import { selectCartItems, selectCartTotal, clearCart } from "../admin/cart/cartSlice";
import { ordersApi } from "../admin/orders/ordersApi";
import { customersApi, type AddressDto } from "../admin/customers/customersApi";
import {
  CheckCircle, MapPin, CreditCard, Truck, ArrowLeft, Loader2,
  Calendar, Clock, MessageSquare, Plus, Home, Briefcase, ChevronDown, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ui/Toast";
import { MdDeliveryDining } from "react-icons/md";

/* ─── Delivery Slot Options ─── */
const DELIVERY_SLOTS = [
  { value: "morning", label: "Morning (8 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 5 PM)" },
  { value: "evening", label: "Evening (5 PM – 9 PM)" },
];

// ✅ Updated Tip Presets
const TIP_PRESETS = [0, 1, 3, 5];

const ADDRESS_TYPES = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

const EMIRATES = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);

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

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TELR">("COD");

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Add address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "home", full_name: "", phone_number: "", building_name: "",
    flat_villa_number: "", street_address: "", area: "", city: "",
    emirate: "", country: "AE", address_type: "home"
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!addressForm.full_name || addressForm.full_name.trim().length < 3) {
      errors.full_name = "Full name must be at least 3 characters";
    }
    if (!addressForm.phone_number || !/^\+?[0-9]{10,15}$/.test(addressForm.phone_number.replace(/\s/g, ""))) {
      errors.phone_number = "Enter a valid phone number (+971...)";
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
  const shippingCost = cartTotal > 500 ? 0 : 50;
  const effectiveTip = isCustomTip ? (parseFloat(customTip) || 0) : tipAmount;
  const finalTotal = Number((cartTotal + shippingCost + effectiveTip).toFixed(2));

  // Min date = earliest possible delivery (based on tier estimation)
  const deliveryDaysNeeded = estimation?.max_delivery_days || 1;
  const minDate = new Date(Date.now() + deliveryDaysNeeded * 86400000).toISOString().split("T")[0];

  // ─── Add Address Handler ───
  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setSavingAddress(true);
    try {
      const newAddr = await customersApi.createAddress(addressForm as any);
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
      const payload: any = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        preferred_delivery_date: deliveryDate,
      };
      if (deliverySlot) payload.preferred_delivery_slot = deliverySlot;
      if (deliveryNotes.trim()) payload.delivery_notes = deliveryNotes.trim();
      if (effectiveTip > 0) payload.tip_amount = effectiveTip;

      const res = await ordersApi.checkout(payload);

      if (res.payment_method === "TELR" && res.payment_url) {
        // Redirect to Telr payment gateway
        window.location.href = res.payment_url;
        return;
      }

      // COD success
      dispatch(clearCart());
      setSuccessOrderId(res.order_id);
      setOrderSuccess(true);
      setTimeout(() => navigate("/"), 4000);
    } catch (error: any) {
      const msg = error?.response?.data?.error || t("alerts.placeOrderFailed");
      toast.show(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Empty Cart ───
  if (cartItems.length === 0 && !orderSuccess) {
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

  // ─── Success ───
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">{t("success.title")}</h2>
        {successOrderId && (
          <p className="text-lg font-bold text-emerald-600 mb-2">
            {t("success.orderId", { id: successOrderId })}
          </p>
        )}
        <p className="text-slate-500 mb-6">{t("success.subtitle")}</p>
        <p className="text-sm text-slate-400">{t("success.redirecting")}</p>
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
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${selectedAddressId === addr.id
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
                        {addr.is_default && (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
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

                      {/* Selected indicator */}
                      {selectedAddressId === addr.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
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
                            {ADDRESS_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Text fields */}
                      {([
                        ["full_name", "Full Name", "John Doe"],
                        ["phone_number", "Phone", "+971 50 123 4567"],
                        ["building_name", "Building", "Al Reem Tower"],
                        ["flat_villa_number", "Flat / Villa", "Apt 4B"],
                        ["street_address", "Street Address", "123 Ocean Drive"],
                        ["area", "Area", "Al Nahda"],
                        ["city", "City", "Dubai"],
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
                            <option value="">Select Emirate</option>
                            {EMIRATES.map((em) => (
                              <option key={em.value} value={em.value}>{em.label}</option>
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
                          <span className="text-slate-500 ml-2">Qty: {item.quantity}</span>
                          <span className="ml-2 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">
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
                    <option value="">Select slot</option>
                    {DELIVERY_SLOTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
              {/* COD */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "COD"
                  ? "border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20"
                  : "border-slate-100 hover:border-slate-200"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{t("payment.cod.title")}</p>
                  <p className="text-xs text-slate-500">{t("payment.cod.subtitle")}</p>
                </div>
                <Truck size={20} className="text-slate-400" />
              </label>

              {/* TELR */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "TELR"
                  ? "border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20"
                  : "border-slate-100 hover:border-slate-200"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TELR"
                  checked={paymentMethod === "TELR"}
                  onChange={() => setPaymentMethod("TELR")}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{t("payment.telr.title")}</p>
                  <p className="text-xs text-slate-500">{t("payment.telr.subtitle")}</p>
                </div>
                <CreditCard size={20} className="text-slate-400" />
              </label>
            </div>
          </section>
        </div>

        {/* ═══ Right Column - Order Summary ═══ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-black text-slate-900">{t("summary.title")}</h2>

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
                  {t("currency.aed", { value: cartTotal.toFixed(2) })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("summary.shipping")}</span>
                <span className={`font-bold ${shippingCost === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                  {shippingCost === 0 ? t("summary.free") : t("currency.aed", { value: shippingCost.toFixed(2) })}
                </span>
              </div>

              {effectiveTip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("summary.tip")}</span>
                  <span className="font-bold text-rose-500">
                    {t("currency.aed", { value: effectiveTip.toFixed(2) })}
                  </span>
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
                disabled={submitting || !selectedAddressId}
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