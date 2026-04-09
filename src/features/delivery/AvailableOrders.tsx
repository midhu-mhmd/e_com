import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { deliveryApi, type DeliveryOrder } from "./deliveryApi";

const AvailableOrders: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.getAvailableOrders();
      setOrders(Array.isArray(data) ? data : (data as any).results ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClaim = async (orderId: number) => {
    setClaimingId(orderId);
    try {
      await deliveryApi.claimOrder(orderId);
      setToast({ type: "success", msg: `Order #${orderId} claimed!` });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to claim order";
      setToast({ type: "error", msg });
    } finally {
      setClaimingId(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">Available Orders</h1>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

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

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Inbox size={36} />
          <p className="text-sm">No available orders in your region right now.</p>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors mt-1"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      )}

      {!loading && !error && orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3"
        >
          {/* Order header */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">Order #{order.id}</span>
            <span className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{order.shipping_address_details?.full_name}</p>
              <p className="text-xs text-gray-400">
                {order.shipping_address_details?.street_address},{" "}
                {order.shipping_address_details?.area},{" "}
                {order.shipping_address_details?.emirate}
              </p>
            </div>
          </div>

          {/* Items summary */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Package size={13} />
            {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-gray-700">AED {order.total_amount}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Link
              to={`/delivery/orders/${order.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View details <ChevronRight size={14} />
            </Link>
            <button
              onClick={() => handleClaim(order.id)}
              disabled={claimingId === order.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-60"
            >
              {claimingId === order.id ? (
                <><Loader2 size={14} className="animate-spin" /> Claiming…</>
              ) : (
                "Claim Order"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailableOrders;
