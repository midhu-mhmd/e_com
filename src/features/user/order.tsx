import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle, ArrowLeft, Package,
    Clock, CheckCircle, XCircle, Truck,
    ChevronRight, MapPin, CreditCard, FileText, Star, X, Loader2, Image as ImageIcon, Download
} from "lucide-react";
import { ordersApi, type OrderDto, type OrderItemDto } from "../admin/orders/ordersApi";
import { reviewsApi } from "../admin/reviews/reviewsApi";
import { useToast } from "../../components/ui/Toast";
import useLanguageToggle from "../../hooks/useLanguageToggle";
import { useAppSelector } from "../../hooks";
import { API_BASE_URL } from "../../config/constants";

/* ══════════════════════════════════════════════════
   STATUS HELPERS
   ══════════════════════════════════════════════════ */
const STATUS_MAP: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    pending: { color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={16} />, label: "Pending" },
    confirmed: { color: "text-blue-700", bg: "bg-blue-100", icon: <CheckCircle size={16} />, label: "Confirmed" },
    processing: { color: "text-indigo-700", bg: "bg-indigo-100", icon: <Package size={16} />, label: "Processing" },
    shipped: { color: "text-cyan-700", bg: "bg-cyan-100", icon: <Truck size={16} />, label: "Shipped" },
    delivered: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle size={16} />, label: "Delivered" },
    completed: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle size={16} />, label: "Completed" },
    cancelled: { color: "text-rose-700", bg: "bg-rose-100", icon: <XCircle size={16} />, label: "Cancelled" },
    returned: { color: "text-slate-700", bg: "bg-slate-200", icon: <XCircle size={16} />, label: "Returned" },
};

const getStatus = (status: string) =>
    STATUS_MAP[status.toLowerCase()] || STATUS_MAP.pending;

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });

const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-AE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/* ══════════════════════════════════════════════════
   REVIEW MODAL (MINIMAL & INDUSTRY STANDARD)
   ══════════════════════════════════════════════════ */
interface ReviewForm {
    product: number;
    product_name: string;
    product_image?: string | null;
    rating: number;
    comment: string;
    images?: File[];
    review_id?: number;
    existing_images?: string[];
}

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((s) => {
                const isActive = s <= (hover || value);
                return (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHover(s)}
                        className="transition-transform hover:scale-110 active:scale-90 focus:outline-none p-1"
                    >
                        <Star
                            size={32}
                            strokeWidth={isActive ? 0 : 1.5}
                            className={`transition-all duration-200 ${isActive
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                                : "text-slate-300 fill-transparent"
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

const getRatingText = (rating: number) => {
    switch (rating) {
        case 1: return "Poor";
        case 2: return "Fair";
        case 3: return "Good";
        case 4: return "Very Good";
        case 5: return "Excellent";
        default: return "Tap to rate";
    }
};

const ReviewModal: React.FC<{
    items: OrderItemDto[];
    onClose: () => void;
}> = ({ items, onClose }) => {
    const toast = useToast();
    const { isArabic } = useLanguageToggle();
    const userId = useAppSelector((s) => (s as any).auth.user?.id);

    // Filter out items that do not have a valid product ID (e.g., deleted products)
    const validItems = items.filter((item) => {
        const pid = (item as any).product?.id || item.product || (item as any).product_id;
        return !!pid;
    });

    const [forms, setForms] = useState<ReviewForm[]>(
        validItems.map((item) => {
            const possibleProductId = (item as any).product?.id || item.product || (item as any).product_id;
            return {
                product: possibleProductId,
                product_name: item.product_name,
                product_image: item.product_image,
                rating: 0, // Default to 0 to encourage active selection
                comment: "",
                images: [],
            };
        })
    );
    const [submitting, setSubmitting] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        let mounted = true;
        async function loadExisting() {
            if (!userId) return;
            const next = [...forms];
            for (let i = 0; i < validItems.length; i++) {
                const item = validItems[i];
                const pid = (item as any).product?.id || item.product || (item as any).product_id;
                try {
                    const res = await reviewsApi.list({ product: pid, limit: 10 });
                    const mine = (res?.results || []).find((r) => r.user === userId);
                    if (mine) {
                        const idx = next.findIndex((f) => f.product === pid);
                        if (idx !== -1) {
                            next[idx] = {
                                ...next[idx],
                                rating: mine.rating,
                                comment: mine.comment || "",
                                review_id: mine.id,
                                existing_images: Array.isArray(mine.images) ? (mine.images as any) : [],
                            };
                        }
                    }
                } catch {
                }
            }
            if (mounted) setForms(next);
        }
        loadExisting();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, items.length]);

    if (validItems.length === 0) {
        return (
            <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl z-10 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Unavailable</h3>
                    <p className="text-slate-500 mb-6">These products are no longer in the catalog and cannot be reviewed.</p>
                    <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const current = forms[currentIdx];
    const isLast = currentIdx === forms.length - 1;

    const normalizeMedia = (input: any) => {
        if (!input) return "";
        // File/Blob preview
        if (typeof File !== "undefined" && input instanceof File) {
            try { return URL.createObjectURL(input); } catch { /* ignore */ }
        }
        // Object from API: try common keys
        if (typeof input === "object") {
            const candidate = input.url || input.image || input.path || input.src;
            if (typeof candidate === "string") return normalizeMedia(candidate);
            return "";
        }
        // Must be string at this point
        const src: string = String(input);
        if (!src) return "";
        if (/^https?:\/\//i.test(src)) return src;
        const apiBase: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL || (API_BASE_URL as any);
        const mediaBase =
            (import.meta as any).env?.VITE_MEDIA_BASE_URL ||
            (apiBase && /^https?:\/\//i.test(apiBase) ? new URL(apiBase).origin : window.location.origin);
        if (src.startsWith("/")) return `${mediaBase}${src}`;
        return `${mediaBase}/${src.replace(/^\.?\/*/, "")}`;
    };

    const updateField = (field: keyof ReviewForm, value: any) => {
        setForms((prev) =>
            prev.map((f, i) => (i === currentIdx ? { ...f, [field]: value } : f))
        );
    };

    const handleNext = () => {
        setDirection(1);
        setCurrentIdx((i) => i + 1);
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentIdx((i) => Math.max(0, i - 1));
    };

    const handleSubmitAll = async () => {
        // Validate: At least one review with rating and comment
        const toSubmit = forms.filter((f) => f.rating > 0);
        if (toSubmit.length === 0) {
            toast.show("Please rate at least one item before submitting.", "error");
            return;
        }
        if (toSubmit.some((f) => !f.comment || !f.comment.trim())) {
            toast.show("Please add a comment for each rated item.", "error");
            return;
        }

        setSubmitting(true);
        try {
            for (const f of toSubmit) {
                if (f.review_id) {
                    await reviewsApi.update(f.review_id, {
                        rating: f.rating,
                        comment: f.comment.trim(),
                        uploaded_images: f.images && f.images.length ? f.images : undefined,
                    });
                } else {
                    await reviewsApi.create({
                        product: f.product,
                        rating: f.rating,
                        comment: f.comment.trim(),
                        uploaded_images: f.images && f.images.length ? f.images : undefined,
                    });
                }
            }
            toast.show("Reviews submitted! Thank you 🎉", "success");
            onClose();
        } catch (err: any) {
            const status = err?.response?.status;
            const apiErr = err?.response?.data;
            // Surface as much backend detail as possible for quick diagnosis
            const detail =
                (typeof apiErr === "string" && apiErr) ||
                apiErr?.detail ||
                apiErr?.message ||
                JSON.stringify(apiErr);
            const msg = status ? `Error ${status}: ${detail || "Failed to submit reviews."}` : (detail || "Failed to submit reviews.");
            console.error("Review submission error:", { status, data: apiErr });
            toast.show(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 })
    };

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6">
            {/* Minimal Blur Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col"
            >
                {/* Absolute Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} z-20 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors`}
                >
                    <X size={18} />
                </button>

                <div className="relative overflow-hidden flex-1">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIdx}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="p-6 pt-8 space-y-8"
                        >
                            {/* Product Header Context */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {current.product_image ? (
                                        <img src={current.product_image} alt={current.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <div className={`${isArabic ? 'pl-6' : 'pr-6'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{current.review_id ? "Edit your review" : "Rate your purchase"}</p>
                                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{current.product_name}</h3>
                                </div>
                            </div>

                            {/* Interactive Star Rating */}
                            <div className="flex flex-col items-center justify-center space-y-3 py-2">
                                <StarRating value={current.rating} onChange={(v) => updateField("rating", v)} />
                                <span className={`text-[11px] font-bold uppercase tracking-widest h-4 transition-colors ${current.rating > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {getRatingText(current.rating)}
                                </span>
                            </div>

                            {/* Minimal Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <textarea
                                        rows={3}
                                        value={current.comment}
                                        onChange={(e) => updateField("comment", e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium placeholder:text-slate-400 resize-none"
                                        placeholder="Share details of your experience..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                                        {current.review_id ? "Add More Photos (Optional)" : "Add Photos (Optional)"}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = e.target.files ? Array.from(e.target.files) : [];
                                            updateField("images", files);
                                        }}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                                    />
                                    {current.images && current.images.length > 0 && (
                                        <div className="mt-3 flex gap-2 flex-wrap">
                                            {current.images.map((file, idx) => (
                                                <img
                                                    key={idx}
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {current.review_id && current.existing_images && current.existing_images.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Existing Photos</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {current.existing_images.slice(0, 6).map((src, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={normalizeMedia(src as any)}
                                                        alt="existing"
                                                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Minimal Footer */}
                <div className="p-6 pt-2 pb-6">
                    <div className="flex items-center justify-between gap-4">
                        {forms.length > 1 ? (
                            // Progress dots for multiple items
                            <div className={`flex gap-1.5 ${isArabic ? 'mr-2' : 'ml-2'}`}>
                                {forms.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? "bg-slate-900 w-5" : "bg-slate-200 w-1.5"}`}
                                    />
                                ))}
                            </div>
                        ) : <div />}

                        <div className="flex gap-2 flex-1 justify-end">
                            {currentIdx > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Back
                                </button>
                            )}

                            {!isLast ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitAll}
                                    disabled={submitting || current.rating === 0}
                                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
const OrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (id) return <OrderDetail orderId={parseInt(id)} />;
    return <OrderList />;
};

/* ══════════════════════════════════════════════════
   ORDER LIST VIEW
   ══════════════════════════════════════════════════ */
const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");
    const [reviewOrder, setReviewOrder] = useState<OrderDto | null>(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await ordersApi.list();
            setOrders(data.results || []);
        } catch {
            setError("Failed to load your orders.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "all"
        ? orders
        : orders.filter((o) => o.status.toLowerCase() === filter);

    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
        const key = o.status.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-900 pb-24 top-0 pt-0">
            {/* Minimal Header Space */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Orders</h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage and track your recent purchases.</p>
                    </div>

                    {/* Floating Filter Pills */}
                    {!loading && orders.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { key: "all", label: "All", count: orders.length },
                                { key: "pending", label: "Pending", count: statusCounts.pending || 0 },
                                { key: "processing", label: "Processing", count: statusCounts.processing || 0 },
                                { key: "shipped", label: "Shipped", count: statusCounts.shipped || 0 },
                                { key: "delivered", label: "Delivered", count: statusCounts.delivered || 0 },
                                { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled || 0 },
                            ].filter((f) => f.key === "all" || f.count > 0).map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${filter === f.key
                                        ? "bg-slate-900 text-white shadow-md transform scale-105"
                                        : "bg-white text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {f.label} <span className={filter === f.key ? "text-slate-300" : "text-slate-400"}>{f.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 h-72 animate-pulse flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
                                    <div className="w-24 h-8 bg-slate-100 rounded-full" />
                                </div>
                                <div>
                                    <div className="h-4 bg-slate-100 w-1/3 mb-2 rounded" />
                                    <div className="h-8 bg-slate-100 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center max-w-2xl mx-auto shadow-sm">
                        <AlertCircle className="mx-auto text-red-400 mb-6" size={48} />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">We ran into an issue</h3>
                        <p className="text-slate-500 mb-8">{error}</p>
                        <button onClick={fetchOrders} className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors">
                            Refresh Page
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-16 text-center max-w-2xl mx-auto shadow-sm">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package className="text-slate-400" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                            {filter === "all" ? "No orders yet" : "No results found"}
                        </h3>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto">
                            {filter === "all"
                                ? "You haven't purchased anything yet. Time to fill up your cart!"
                                : "We couldn't find any orders matching this filter."}
                        </p>
                        {filter === "all" ? (
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center px-8 py-4 bg-cyan-600 text-white rounded-full font-bold text-base hover:bg-cyan-700 hover:scale-105 transition-all shadow-lg shadow-cyan-600/30"
                            >
                                Start Shopping
                            </Link>
                        ) : (
                            <button onClick={() => setFilter("all")} className="text-slate-900 font-bold hover:underline underline-offset-4">
                                Show all orders
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((order, index) => {
                                const st = getStatus(order.status);
                                return (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="block h-full bg-white rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                                        >
                                            <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                                                <div className="flex -space-x-4">
                                                    {order.items.slice(0, 3).map((item, i) => (
                                                        <div key={i} className="w-14 h-14 rounded-2xl bg-slate-50 border-4 border-white flex items-center justify-center shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform overflow-hidden">
                                                            {item.product_image ? (
                                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={20} className="text-slate-400" />
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="w-14 h-14 rounded-2xl bg-cyan-50 border-4 border-white flex items-center justify-center shadow-sm relative z-10 text-cyan-700 font-bold text-sm">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${st.bg} ${st.color}`}>
                                                    {st.icon} {st.label}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-cyan-600 transition-colors">
                                                    #{order.id}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-400 mt-2">
                                                    Ordered on {formatDate(order.created_at)}
                                                </p>
                                            </div>

                                            {order.status.toLowerCase() === "delivered" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setReviewOrder(order);
                                                    }}
                                                    className="mt-6 w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700 transition-all duration-200"
                                                >
                                                    <Star size={16} className="text-slate-400" />
                                                    Write Review
                                                </button>
                                            )}

                                            <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-100">
                                                <div className="text-2xl font-black text-slate-900">
                                                    AED {parseFloat(order.total_amount).toFixed(2)}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors text-slate-400">
                                                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Review Modal Wrapper */}
            <AnimatePresence>
                {reviewOrder && (
                    <ReviewModal
                        items={reviewOrder.items}
                        onClose={() => setReviewOrder(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ORDER DETAIL VIEW (BENTO BOX GRID)
   ══════════════════════════════════════════════════ */
const OrderDetail: React.FC<{ orderId: number }> = ({ orderId }) => {
    const navigate = useNavigate();
    const { isArabic } = useLanguageToggle();
    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await ordersApi.details(orderId);
                setOrder(data);
            } catch {
                setError("Failed to load order.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] font-sans pb-24 pt-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
                    <div className="h-10 bg-slate-200 rounded-xl w-32 animate-pulse" />
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
                    <div className="md:col-span-12 h-40 bg-white rounded-[2rem]" />
                    <div className="md:col-span-8 h-96 bg-white rounded-[2rem]" />
                    <div className="md:col-span-4 h-96 bg-white rounded-[2rem]" />
                    <div className="md:col-span-4 h-48 bg-white rounded-[2rem]" />
                    <div className="md:col-span-4 h-48 bg-white rounded-[2rem]" />
                    <div className="md:col-span-4 h-48 bg-slate-900 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[2rem] max-w-lg w-full shadow-sm">
                    <AlertCircle className="mx-auto text-red-500 mb-6" size={48} />
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Error</h3>
                    <p className="text-slate-500 mb-8">{error || "Order not found"}</p>
                    <button onClick={() => navigate("/orders")} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors w-full">
                        Return to Orders
                    </button>
                </div>
            </div>
        );
    }

    const st = getStatus(order.status);
    const addr = order.shipping_address_details;
    const payment = order.payment;
    const subtotal = order.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
    const isPaymentSuccess = ["SUCCESS", "PAID", "COMPLETED"].includes((payment?.status || "").toUpperCase());
    const tipAmount = Number(((order as any)?.tip_amount) || 0);

    const canDownloadReceipt =
        !!payment &&
        !!payment.receipt &&
        ["SUCCESS", "PAID", "COMPLETED"].includes((payment.status || "").toUpperCase());

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleDownloadReceiptImage = async () => {
        try {
            const b = await ordersApi.receiptImage(order.id);
            const num = payment?.receipt?.receipt_number || order.id;
            downloadBlob(b, `receipt_${num}.png`);
        } catch {
            // silently ignore; backend already guards by status
        }
    };

    const handleDownloadReceiptPdf = async () => {
        try {
            const b = await ordersApi.receiptPdf(order.id);
            const num = payment?.receipt?.receipt_number || order.id;
            downloadBlob(b, `receipt_${num}.pdf`);
        } catch {
            // silently ignore
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans pb-24 pt-8">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
                <button onClick={() => navigate("/orders")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-slate-900 font-bold hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Meta Bento */}
                    <div className="md:col-span-12 bg-white rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-6 ${st.bg} ${st.color}`}>
                                {st.icon} {st.label}
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">Order #{order.id}</h1>
                            <p className="text-lg text-slate-500 font-medium">Placed {formatDateTime(order.created_at)}</p>
                        </div>
                        <div className="hidden sm:flex self-stretch items-center">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Order Total</p>
                                <p className="text-4xl font-black text-slate-900">AED {parseFloat(order.total_amount).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Write Review button for delivered orders */}
                        {order.status.toLowerCase() === "delivered" && (
                            <button
                                onClick={() => setReviewOpen(true)}
                                className="relative z-10 mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold transition-all duration-200 hover:shadow-lg active:scale-95"
                            >
                                <Star size={18} className="text-yellow-400 fill-current" />
                                Write Review
                            </button>
                        )}

                        {/* Decorative watermark */}
                        <div className="absolute -right-10 -bottom-10 pointer-events-none opacity-[0.03]">
                            <Package size={250} />
                        </div>
                    </div>

                    {/* Items Bento */}
                    <section className="md:col-span-8 bg-white rounded-[2rem] p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Package size={20} /></div>
                                Ordered Items
                            </h2>
                            <span className="font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">{order.items.length} items</span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {order.items.map((item) => {
                                const pid = (item as any).product?.id || item.product || (item as any).product_id;
                                return (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-24 h-24 bg-white rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                                        {item.product_image ? (
                                            <img
                                                src={item.product_image}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => pid ? navigate(`/products/${pid}`) : undefined}
                                            />
                                        ) : (
                                            <Package size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3
                                            className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 cursor-pointer hover:underline"
                                            onClick={() => pid ? navigate(`/products/${pid}`) : undefined}
                                        >
                                            {item.product_name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="bg-slate-200 px-3 py-1 rounded-lg text-sm font-bold text-slate-700">Qty: {item.quantity}</span>
                                            <span className="text-sm font-semibold text-slate-500">AED {parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="sm:self-center">
                                        <p className="text-xl font-black text-slate-900">AED {parseFloat(item.subtotal).toFixed(2)}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </section>

                    {/* Timeline Bento */}
                    <section className="md:col-span-4 bg-white rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Clock size={20} /></div>
                            <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
                        </div>

                        {(() => {
                            const currentStatus = (order.status || "").toLowerCase();
                            const isCancelled = currentStatus === "cancelled";

                            const LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
                                pending: { label: "Pending", icon: <Clock size={16} /> },
                                paid: { label: "Paid", icon: <CreditCard size={16} /> },
                                processing: { label: "Processing", icon: <Package size={16} /> },
                                shipped: { label: "Shipped", icon: <Truck size={16} /> },
                                delivered: { label: "Delivered", icon: <CheckCircle size={16} /> },
                                cancelled: { label: "Cancelled", icon: <XCircle size={16} /> },
                            };

                            const allowed = new Set(Object.keys(LABELS));

                            const history = (order.status_history || [])
                                .filter((h) => allowed.has((h.status || "").toLowerCase()))
                                .map((h) => ({
                                    key: (h.status || "").toLowerCase(),
                                    created_at: h.created_at,
                                    notes: h.notes,
                                }))
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                            // Keep first occurrence per status to avoid repeats
                            const dedupMap = new Map<string, { key: string; created_at: string; notes?: string }>();
                            for (const h of history) {
                                if (!dedupMap.has(h.key)) dedupMap.set(h.key, h);
                            }
                            let steps = Array.from(dedupMap.values());

                            // Ensure current status appears at the end if missing in history
                            if (currentStatus && allowed.has(currentStatus) && !steps.find((s) => s.key === currentStatus)) {
                                steps = steps.concat([{ key: currentStatus, created_at: order.updated_at || order.created_at, notes: undefined }]);
                            }

                            // If cancelled, append cancelled if not present, at its actual place (end)
                            if (isCancelled && !steps.find((s) => s.key === "cancelled")) {
                                steps = steps.concat([{ key: "cancelled", created_at: order.updated_at || order.created_at, notes: undefined }]);
                            }

                            const activeIdx = steps.findIndex((s) => s.key === (isCancelled ? "cancelled" : currentStatus));

                            return (
                                <div className="space-y-0 relative">
                                    {steps.map((step, idx) => {
                                        const isActive = idx === activeIdx;
                                        const isCompleted = idx < activeIdx && step.key !== "cancelled";
                                        const isLast = idx === steps.length - 1;
                                        const historyEntry = { created_at: step.created_at, notes: step.notes };

                                        let dotClass = "";
                                        let labelClass = "";
                                        let lineClass = "";

                                        if (step.key === "cancelled") {
                                            dotClass = "border-rose-500 bg-rose-500";
                                            labelClass = "text-rose-600";
                                            lineClass = "bg-rose-200";
                                        } else if (isCompleted) {
                                            dotClass = "border-emerald-500 bg-emerald-500";
                                            labelClass = "text-slate-900";
                                            lineClass = "bg-emerald-300";
                                        } else if (isActive) {
                                            dotClass = "border-cyan-500 bg-cyan-500 ring-4 ring-cyan-100";
                                            labelClass = "text-slate-900";
                                            lineClass = "bg-slate-200";
                                        } else {
                                            dotClass = "border-slate-200 bg-white";
                                            labelClass = "text-slate-400";
                                            lineClass = "bg-slate-100";
                                        }

                                        return (
                                            <div key={step.key} className="relative flex items-start gap-5">
                                                {/* Connector line */}
                                                {!isLast && (
                                                    <div
                                                        className={`absolute left-[11px] top-7 w-[2px] h-[calc(100%)] ${lineClass}`}
                                                    />
                                                )}

                                                {/* Dot */}
                                                <div className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border-[3px] z-10 shrink-0 transition-all duration-300 ${dotClass}`}>
                                                    {(isCompleted || isActive || step.key === "cancelled") && (
                                                        <span className="text-white">
                                                            {(isCompleted || step.key === "cancelled") ? <CheckCircle size={12} /> : null}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`${labelClass} transition-colors`}>
                                                            {LABELS[step.key]?.icon}
                                                        </span>
                                                        <span className={`font-bold text-base ${labelClass} transition-colors`}>
                                                            {LABELS[step.key]?.label ?? step.key}
                                                        </span>
                                                        {isActive && step.key !== "cancelled" && (
                                                            <span className="relative flex h-2.5 w-2.5 ml-1">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {historyEntry && (
                                                        <div className="text-xs font-semibold text-slate-400 mt-1">
                                                            {formatDateTime(historyEntry.created_at)}
                                                        </div>
                                                    )}
                                                    {historyEntry?.notes && (
                                                        <div className="mt-2 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                                                            {historyEntry.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </section>

                    {/* Address Bento */}
                    {addr ? (
                        <section className="md:col-span-4 bg-white rounded-[2rem] p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={20} /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-2">{addr.full_name}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {[addr.flat_villa_number, addr.building_name, addr.street_address].filter(Boolean).join(", ")}<br />
                                    {[addr.area, addr.city, addr.emirate].filter(Boolean).join(", ")}
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 font-bold text-slate-900">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Phone</span>
                                    {addr.phone_number}
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                            [addr.flat_villa_number, addr.building_name, addr.street_address, addr.area, addr.city, addr.emirate]
                                                .filter(Boolean).join(", ")
                                        )}${addr.latitude && addr.longitude ? `&destination_place_id=&travelmode=driving` : ""}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50"
                                    >
                                        Directions
                                    </a>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <div className="md:col-span-4 bg-white rounded-[2rem]" />
                    )}

                    {/* Payment Bento */}
                    {payment ? (
                        <section className="md:col-span-4 bg-white rounded-[2rem] p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><CreditCard size={20} /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Payment</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 mb-1">Status</p>
                                        <p className={`capitalize font-black text-lg ${payment.status.toLowerCase() === "completed" || payment.status.toLowerCase() === "paid"
                                            ? "text-emerald-500"
                                            : payment.status.toLowerCase() === "failed"
                                                ? "text-rose-500"
                                                : "text-amber-500"
                                            }`}>{payment.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 mb-1">Method</p>
                                        <p className="font-black text-lg text-slate-900 uppercase">{payment.payment_method}</p>
                                    </div>
                                    {payment.transaction_id && (
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 mb-1">Transaction ID</p>
                                            <p className="font-mono font-bold text-sm text-slate-700">{payment.transaction_id}</p>
                                        </div>
                                    )}
                                    {isPaymentSuccess && payment.created_at && (
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 mb-1">Payment Date</p>
                                            <p className="font-bold text-sm text-slate-700">{formatDateTime(payment.created_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {payment.receipt && (
                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400">Receipt Ref.</span>
                                        <span className="font-mono font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">{payment.receipt.receipt_number}</span>
                                    </div>
                                    {canDownloadReceipt && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDownloadReceiptImage}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50"
                                            >
                                                <ImageIcon size={16} /> Download Image
                                            </button>
                                            <button
                                                onClick={handleDownloadReceiptPdf}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50"
                                            >
                                                <Download size={16} /> Download PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    ) : (
                        <div className="md:col-span-4 bg-white rounded-[2rem]" />
                    )}

                    {/* Delivery Notes Bento */}
                    {order.delivery_notes && (
                        <section className="md:col-span-4 bg-white rounded-[2rem] p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><FileText size={20} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Delivery Notes</h2>
                            </div>
                            <p className={`text-slate-600 font-medium leading-relaxed italic border-slate-200 ${isArabic ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>{order.delivery_notes}</p>
                        </section>
                    )}

                    {/* Total Summary Bento */}
                    <section className="md:col-span-4 bg-slate-900 text-white rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6">Summary</h2>
                            <div className="space-y-4 text-sm font-bold text-slate-400">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-white text-base">AED {subtotal.toFixed(2)}</span>
                                </div>
                                {tipAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>Tip Added</span>
                                        <span className="text-white text-base">AED {tipAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {order.preferred_delivery_date && (
                                    <div className="flex justify-between items-center">
                                        <span>Delivery Date</span>
                                        <span className="text-white text-base">{order.preferred_delivery_date}</span>
                                    </div>
                                )}
                                {order.preferred_delivery_slot && (
                                    <div className="flex justify-between items-center">
                                        <span>Time Slot</span>
                                        <span className="text-white text-base capitalize">{order.preferred_delivery_slot}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-end relative z-10">
                            <span className="font-bold text-slate-400 mb-1">Total Amount</span>
                            <span className="text-4xl font-black text-cyan-400">AED {parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>

                        {/* Decorative background shape */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    </section>

                </div>
            </main>

            {/* Review Modal Wrapper */}
            <AnimatePresence>
                {reviewOpen && order && (
                    <ReviewModal
                        items={order.items}
                        onClose={() => setReviewOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderPage;
