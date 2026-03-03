import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle, ArrowLeft, Package,
    Clock, CheckCircle, XCircle, Truck,
    ChevronRight, MapPin, CreditCard, FileText
} from "lucide-react";
import { ordersApi, type OrderDto } from "../admin/orders/ordersApi";

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
                                                    {order.items.slice(0, 3).map((_, i) => (
                                                        <div key={i} className="w-14 h-14 rounded-2xl bg-slate-50 border-4 border-white flex items-center justify-center shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform">
                                                            <Package size={20} className="text-slate-400" />
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
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ORDER DETAIL VIEW (BENTO BOX GRID)
   ══════════════════════════════════════════════════ */
const OrderDetail: React.FC<{ orderId: number }> = ({ orderId }) => {
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                            {order.items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-24 h-24 bg-white rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Package size={32} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{item.product_name}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="bg-slate-200 px-3 py-1 rounded-lg text-sm font-bold text-slate-700">Qty: {item.quantity}</span>
                                            <span className="text-sm font-semibold text-slate-500">AED {parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="sm:self-center">
                                        <p className="text-xl font-black text-slate-900">AED {parseFloat(item.subtotal).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Timeline Bento */}
                    <section className="md:col-span-4 bg-white rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Clock size={20} /></div>
                            <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
                        </div>

                        {order.status_history && order.status_history.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-1 before:bg-slate-100 before:rounded-full">
                                {order.status_history.map((entry, idx) => {
                                    const est = getStatus(entry.status);
                                    const isLast = idx === 0;
                                    return (
                                        <div key={idx} className="relative flex items-start gap-6 group">
                                            {/* Line marker */}
                                            <div className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full border-4 bg-white z-10 ${isLast ? "border-cyan-500" : "border-slate-300"}`}>
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold text-lg leading-none ${isLast ? "text-slate-900" : "text-slate-500"}`}>
                                                    {est.label}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-400 mt-1.5">{formatDateTime(entry.created_at)}</div>
                                                {entry.notes && (
                                                    <div className="mt-3 bg-slate-50 p-4 rounded-xl text-sm font-medium text-slate-600 border border-slate-100">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-500 font-medium">No tracking data available yet.</p>
                        )}
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
                            <div className="mt-6 pt-6 border-t border-slate-100 font-bold text-slate-900 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Phone</span>
                                {addr.phone_number}
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
                                </div>
                            </div>
                            {payment.receipt && (
                                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400">Receipt Ref.</span>
                                    <span className="font-mono font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">{payment.receipt.receipt_number}</span>
                                </div>
                            )}
                        </section>
                    ) : (order.delivery_notes ? (
                        <section className="md:col-span-4 bg-white rounded-[2rem] p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><FileText size={20} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Delivery Notes</h2>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-4">{order.delivery_notes}</p>
                        </section>
                    ) : (
                        <div className="md:col-span-4 bg-white rounded-[2rem]" />
                    ))}

                    {/* Total Summary Bento */}
                    <section className="md:col-span-4 bg-slate-900 text-white rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6">Summary</h2>
                            <div className="space-y-4 text-sm font-bold text-slate-400">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-white text-base">AED {subtotal.toFixed(2)}</span>
                                </div>
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
        </div>
    );
};

export default OrderPage;
