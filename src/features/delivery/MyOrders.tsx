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
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">My Deliveries</h1>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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

      {!loading && !error && visible.map((order) => {
        const assignment = order.delivery_assignment;
        const hasCancelRequest =
          order.cancellation_request?.status === "PENDING";

        return (
          <Link
            key={order.id}
            to={`/delivery/orders/${order.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-cyan-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800">Order #{order.id}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
                {hasCancelRequest && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600">
                    Cancel Pending
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 mb-2">
              <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
              <span>
                {order.shipping_address_details?.street_address},{" "}
                {order.shipping_address_details?.emirate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Package size={12} />
                {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
                <span className="font-semibold text-gray-700">AED {order.total_amount}</span>
              </div>
              {assignment && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    assignment.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-600"
                      : assignment.status === "IN_TRANSIT"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {assignment.status.replace("_", " ")}
                </span>
              )}
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MyOrders;
