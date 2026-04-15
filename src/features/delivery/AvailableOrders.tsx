import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Inbox,
  AlertCircle,
  Loader2,
  MapPin,
  Package,
  ChevronRight,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Available Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Pick up new deliveries in your assigned region</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-3 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-cyan-600 hover:border-cyan-100 hover:shadow-md transition-all disabled:opacity-40"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-cyan-500" />
          <p className="text-sm font-medium">Scanning for orders…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-full">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <p className="text-sm text-red-600 max-w-xs leading-relaxed">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 text-center">
          <div className="p-6 bg-gray-50 rounded-full">
            <Inbox size={48} className="text-gray-200" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">All clear!</p>
            <p className="text-sm">No available orders at the moment.</p>
          </div>
          <button
            onClick={load}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all mt-2"
          >
            Check Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group relative bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-6 hover:border-cyan-200 hover:shadow-2xl hover:shadow-cyan-100/30 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden"
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/3" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-cyan-700 transition-colors">
                    #{order.id}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    POSTED {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-2xl text-gray-300 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-all duration-300">
                  <Package size={20} />
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-gray-50 rounded-lg">
                    <MapPin size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {order.shipping_address_details?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2 uppercase font-medium">
                      {order.shipping_address_details?.street_address}, {order.shipping_address_details?.emirate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex items-center gap-3 relative z-10">
                <Link
                  to={`/delivery/orders/${order.id}`}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-100 text-center text-xs font-black tracking-widest uppercase text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  DETAILS
                </Link>
                <button
                  onClick={() => handleClaim(order.id)}
                  disabled={claimingId === order.id}
                  className="flex-3 px-6 py-3.5 rounded-2xl bg-cyan-600 text-white text-xs font-black tracking-widest uppercase hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {claimingId === order.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      CLAIM
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
