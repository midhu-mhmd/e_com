import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { deliveryApi, type DeliveryDashboardData } from "./deliveryApi";
import { useSelector } from "react-redux";

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function KpiCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 ${
        highlight ? "border-cyan-200 bg-cyan-50" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`${highlight ? "text-cyan-600" : "text-gray-400"}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-cyan-700" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}

const DeliveryDashboard: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [data, setData] = useState<DeliveryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await deliveryApi.getDashboard();
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const profile = data?.delivery_boy;
  const kpi = data?.kpis;
  const recent = data?.recent_assigned_orders ?? [];

  return (
    <div className="space-y-5">
      {/* ─── Greeting ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Hello, {user?.full_name?.split(" ")[0] || "Driver"} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {(profile?.assigned_emirates_display?.length ?? 0) > 0
              ? `Covering: ${profile!.assigned_emirates_display.join(", ")}`
              : "No emirates assigned yet"}
          </p>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            profile?.is_available
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {profile?.is_available ? "● Available" : "○ Unavailable"}
        </div>
      </div>

      {/* ─── KPI cards ─── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Pending assigned"
          value={kpi?.pending_assigned_orders ?? 0}
          icon={<Clock size={16} />}
          highlight
        />
        <KpiCard
          label="Available nearby"
          value={kpi?.available_orders_in_region ?? 0}
          icon={<MapPin size={16} />}
        />
        <KpiCard
          label="Completed today"
          value={kpi?.completed_today ?? 0}
          icon={<CheckCircle2 size={16} />}
        />
        <KpiCard
          label="Total completed"
          value={kpi?.completed_total ?? 0}
          icon={<TrendingUp size={16} />}
        />
      </div>

      {/* ─── Quick actions ─── */}
      <div className="flex gap-3">
        <Link
          to="/delivery/available"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition-colors"
        >
          <Package size={16} />
          Pick up order
        </Link>
        <Link
          to="/delivery/my-orders"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Truck size={16} />
          My deliveries
        </Link>
      </div>

      {/* ─── Recent orders ─── */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Recent Assignments</h2>
            <Link to="/delivery/my-orders" className="text-xs text-cyan-600 font-medium flex items-center gap-0.5">
              See all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/delivery/orders/${order.id}`}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-cyan-200 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-800">Order #{order.id}</span>
                  <span className="text-xs text-gray-400">
                    {order.shipping_address_details?.emirate} · {order.items?.length} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
          No recent assignments. Go pick up an order!
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
