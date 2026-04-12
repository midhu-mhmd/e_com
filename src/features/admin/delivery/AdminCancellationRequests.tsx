import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { deliveryApi } from "../../delivery/deliveryApi";
import { ordersApi } from "../orders/ordersApi";
import type { OrderDto } from "../orders/ordersApi";

// Orders that have a pending cancellation_request will be shown here.
// We filter orders from the general list by checking the cancellation_request field.

interface OrderWithCancel extends OrderDto {
  cancellation_request?: {
    id: number;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requested_by_name: string;
    requested_at: string;
    review_notes?: string;
  };
}

function ReviewModal({
  order,
  onDecide,
  onClose,
  loading,
}: {
  order: OrderWithCancel;
  onDecide: (decision: "approve" | "reject", notes: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Review Cancellation — Order #{order.id}</h3>

        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm">
          <p className="text-xs text-gray-400 mb-1">Reason from delivery boy</p>
          <p className="text-gray-700">{order.cancellation_request?.reason || "No reason provided"}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setDecision("approve")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              decision === "approve"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CheckCircle2 size={14} /> Approve
          </button>
          <button
            onClick={() => setDecision("reject")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              decision === "reject"
                ? "bg-red-50 border-red-300 text-red-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <XCircle size={14} /> Reject
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Review notes (optional)"
          rows={2}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => decision && onDecide(decision, notes)}
            disabled={loading || !decision}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

const AdminCancellationRequests: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithCancel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<OrderWithCancel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [tab, setTab] = useState<"PENDING" | "ALL">("PENDING");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // We fetch all orders and filter those with a cancellation_request
      const data = await ordersApi.list({ limit: 200 } as any);
      const withCancelReq = (data.results as OrderWithCancel[]).filter(
        (o) => (o as any).cancellation_request
      );
      setOrders(withCancelReq);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecide = async (decision: "approve" | "reject", notes: string) => {
    if (!reviewTarget) return;
    setActionLoading(true);
    try {
      await deliveryApi.adminReviewCancelRequest(reviewTarget.id, decision, notes);
      showToast(
        "success",
        `Cancellation ${decision === "approve" ? "approved" : "rejected"} for Order #${reviewTarget.id}`
      );
      await load();
    } catch (e: any) {
      showToast("error", e?.response?.data?.detail || "Failed to process review");
    } finally {
      setActionLoading(false);
      setReviewTarget(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.cancellation_request?.status === "PENDING");
  const visible = tab === "PENDING" ? pendingOrders : orders;

  return (
    <>
      {reviewTarget && (
        <ReviewModal
          order={reviewTarget}
          onDecide={handleDecide}
          onClose={() => setReviewTarget(null)}
          loading={actionLoading}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cancellation Requests</h1>
            {pendingOrders.length > 0 && (
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                {pendingOrders.length} pending review
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("PENDING")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === "PENDING" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending {pendingOrders.length > 0 && `(${pendingOrders.length})`}
          </button>
          <button
            onClick={() => setTab("ALL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === "ALL" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All history
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Inbox size={36} />
            <p className="text-sm">{tab === "PENDING" ? "No pending requests." : "No cancellation requests found."}</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((order) => {
              const req = order.cancellation_request!;
              const isExpanded = expanded === order.id;
              const statusStyles: Record<string, string> = {
                PENDING: "bg-orange-50 text-orange-700 border-orange-200",
                APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                REJECTED: "bg-red-50 text-red-600 border-red-200",
              };

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">Order #{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusStyles[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Requested {new Date(req.requested_at).toLocaleDateString()}
                        {req.requested_by_name ? ` · ${req.requested_by_name}` : ""}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                      {/* Address */}
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-3">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                        {(order.shipping_address_details as any)?.full_name},{" "}
                        {(order.shipping_address_details as any)?.emirate}
                      </div>

                      {/* Reason */}
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-gray-400 mb-1">Delivery boy reason</p>
                        <p className="text-sm text-gray-700">{req.reason}</p>
                      </div>

                      {req.review_notes && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-[10px] text-gray-400 mb-1">Review notes</p>
                          <p className="text-sm text-gray-700">{req.review_notes}</p>
                        </div>
                      )}

                      {req.status === "PENDING" && (
                        <button
                          onClick={() => setReviewTarget(order)}
                          className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                        >
                          Review Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCancellationRequests;
