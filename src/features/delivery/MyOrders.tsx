import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Inbox,
  MapPin,
  Package,
} from "lucide-react";
import { deliveryApi, type DeliveryOrder } from "./deliveryApi";

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const FILTERS = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Filter = (typeof FILTERS)[number];

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.getMyOrders();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setOrders(list);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">My Deliveries</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your active and past orders</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-cyan-600 hover:border-cyan-100 hover:shadow-md hover:-rotate-180 transition-all duration-500 disabled:opacity-40"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-[0.1em] uppercase transition-all duration-300 ${filter === f
                ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 shadow-sm"
              }`}
          >
            {f === "ALL" ? "ALL ORDERS" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading orders…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Inbox size={36} />
          <p className="text-sm">No {filter !== "ALL" ? filter.toLowerCase() : ""} orders found.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-4">
          {visible.map((order) => {
            const assignment = order.delivery_assignment;
            const hasCancelRequest = order.cancellation_request?.status === "PENDING";

            return (
              <Link
                key={order.id}
                to={`/delivery/orders/${order.id}`}
                className="group relative bg-white border border-gray-100 shadow-sm rounded-3xl p-5 flex flex-col gap-4 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/30 hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/3" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-black tracking-tight text-gray-800 group-hover:text-cyan-700 transition-colors">
                      #{order.id}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase shadow-sm border ${STATUS_COLOR[order.status] || "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                    >
                      {order.status}
                    </span>
                    {hasCancelRequest && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase bg-orange-50 text-orange-600 border border-orange-100 animate-pulse">
                        CANCEL PENDING
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600 relative z-10">
                  <div className="mt-0.5 p-1.5 bg-gray-50 rounded-full group-hover:bg-cyan-50 transition-colors duration-300">
                    <MapPin size={14} className="text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-800 transition-colors">
                    {order.shipping_address_details?.street_address}, {order.shipping_address_details?.emirate}
                  </p>
                </div>

                <div className="flex items-center justify-between py-3.5 border-y border-dashed border-gray-100 relative z-10 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Package size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>{order.items?.length ?? 0} ITEMS</span>
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    AED {order.total_amount}
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 mt-auto pt-4">
                  {assignment ? (
                    <span
                      className={`text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg ${assignment.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                          : assignment.status === "IN_TRANSIT"
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                            : "bg-amber-50 text-amber-600 border border-amber-100/50"
                        }`}
                    >
                      {assignment.status.replace("_", " ")}
                    </span>
                  ) : (
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-300">
                      UNASSIGNED
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-gray-900 group-hover:scale-110 flex items-center justify-center transition-all duration-500 shadow-sm">
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
