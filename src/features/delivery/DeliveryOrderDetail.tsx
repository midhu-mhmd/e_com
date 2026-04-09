import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Navigation,
  Phone,
} from "lucide-react";
import { deliveryApi, type DeliveryOrder } from "./deliveryApi";

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

// ─── Confirmation modal ───
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Request Modal ───
function CancelRequestModal({
  onSubmit,
  onClose,
  loading,
}: {
  onSubmit: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Request Cancellation</h3>
        <p className="text-xs text-gray-500">
          Explain why you can't complete this delivery. Admin will review your request.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Customer unreachable, wrong address, etc."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => reason.trim() && onSubmit(reason.trim())}
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Proof Upload Modal ───
function ProofModal({
  onSubmit,
  onClose,
  loading,
}: {
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sigName, setSigName] = useState("");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!imageFile) return;
    const fd = new FormData();
    fd.append("status", "DELIVERED");
    fd.append("proof_image", imageFile);
    if (sigName.trim()) fd.append("signature_name", sigName.trim());
    if (notes.trim()) fd.append("proof_notes", notes.trim());
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Confirm Delivery</h3>
        <p className="text-xs text-gray-500">Upload a proof-of-delivery photo to complete this order.</p>

        {/* Image upload */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-cyan-300 hover:text-cyan-500 transition-colors overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="proof" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="text-xs">Tap to upload photo</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        <input
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          placeholder="Recipient name (optional)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !imageFile}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Mark Delivered"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
const DeliveryOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [showShipConfirm, setShowShipConfirm] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.getOrder(Number(id));
      setOrder(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleShip = async () => {
    setActionLoading(true);
    try {
      await deliveryApi.updateStatus(Number(id), { status: "SHIPPED", notes: "Picked up from warehouse" });
      showToast("success", "Order marked as Shipped");
      await loadOrder();
    } catch (e: any) {
      showToast("error", e?.response?.data?.detail || "Failed to update status");
    } finally {
      setActionLoading(false);
      setShowShipConfirm(false);
    }
  };

  const handleProofSubmit = async (fd: FormData) => {
    setActionLoading(true);
    try {
      await deliveryApi.submitProof(Number(id), fd);
      showToast("success", "Order marked as Delivered!");
      await loadOrder();
    } catch (e: any) {
      const errs = e?.response?.data;
      const msg =
        errs?.proof_image?.[0] ||
        errs?.detail ||
        e?.message ||
        "Failed to submit proof";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
      setShowProofModal(false);
    }
  };

  const handleCancelRequest = async (reason: string) => {
    setActionLoading(true);
    try {
      await deliveryApi.updateStatus(Number(id), { status: "CANCELLED", reason });
      showToast("success", "Cancellation request submitted for admin review.");
      await loadOrder();
    } catch (e: any) {
      showToast("error", e?.response?.data?.detail || "Failed to submit cancellation request");
    } finally {
      setActionLoading(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-sm text-red-600">{error || "Order not found"}</p>
        <button
          onClick={loadOrder}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const addr = order.shipping_address_details;
  const assignment = order.delivery_assignment;
  const cancelReq = order.cancellation_request;
  const hasProof = !!order.delivery_proof;
  const canShip = ["PAID", "PROCESSING"].includes(order.status) && assignment?.status !== "IN_TRANSIT";
  const canDeliver = order.status === "SHIPPED";
  const canRequestCancel =
    !["DELIVERED", "CANCELLED"].includes(order.status) &&
    cancelReq?.status !== "PENDING";

  return (
    <>
      {/* Modals */}
      {showShipConfirm && (
        <ConfirmModal
          message={`Mark Order #${order.id} as Shipped?`}
          onConfirm={handleShip}
          onCancel={() => setShowShipConfirm(false)}
          loading={actionLoading}
        />
      )}
      {showProofModal && (
        <ProofModal
          onSubmit={handleProofSubmit}
          onClose={() => setShowProofModal(false)}
          loading={actionLoading}
        />
      )}
      {showCancelModal && (
        <CancelRequestModal
          onSubmit={handleCancelRequest}
          onClose={() => setShowCancelModal(false)}
          loading={actionLoading}
        />
      )}

      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

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

        {/* Order header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-bold text-gray-800">Order #{order.id}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Placed {new Date(order.created_at).toLocaleDateString()}
          </p>

          {cancelReq?.status === "PENDING" && (
            <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 text-xs text-orange-700">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cancellation request pending review</p>
                <p className="text-orange-500 mt-0.5">{cancelReq.reason}</p>
              </div>
            </div>
          )}
          {cancelReq?.status === "REJECTED" && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-600">
              Cancellation rejected: {cancelReq.review_notes || "No notes provided."}
            </div>
          )}
        </div>

        {/* Delivery address */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliver to</h2>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800">{addr.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {addr.street_address}, {addr.area}, {addr.city}, {addr.emirate}
              </p>
              {addr.phone_number && (
                <a
                  href={`tel:${addr.phone_number}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-600 font-medium"
                >
                  <Phone size={12} /> {addr.phone_number}
                </a>
              )}
            </div>
          </div>

          {addr.latitude && addr.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${addr.latitude},${addr.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-200 text-cyan-700 text-sm font-semibold hover:bg-cyan-50 transition-colors"
            >
              <Navigation size={14} /> Get Directions
            </a>
          )}
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Items ({order.items?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Package size={14} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-xs text-gray-400">
                    Qty {item.quantity} · AED {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-sm font-bold text-gray-800">
            <span>Total</span>
            <span>AED {order.total_amount}</span>
          </div>
        </div>

        {/* Assignment status */}
        {assignment && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-gray-800">{assignment.status.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Assigned at</span>
              <span className="text-gray-700">{new Date(assignment.assigned_at).toLocaleString()}</span>
            </div>
            {assignment.delivered_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivered at</span>
                <span className="text-gray-700">{new Date(assignment.delivered_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Proof of delivery */}
        {hasProof && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Proof of Delivery</h2>
            </div>
            {order.delivery_proof!.proof_image && (
              <img
                src={order.delivery_proof!.proof_image}
                alt="delivery proof"
                className="w-full rounded-xl border border-gray-100 object-cover max-h-48"
              />
            )}
            {order.delivery_proof!.signature_name && (
              <p className="text-xs text-gray-500">
                Received by: <span className="font-medium text-gray-700">{order.delivery_proof!.signature_name}</span>
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          {canShip && (
            <button
              onClick={() => setShowShipConfirm(true)}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <Truck size={16} /> Mark as Shipped
            </button>
          )}
          {canDeliver && (
            <button
              onClick={() => setShowProofModal(true)}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <CheckCircle2 size={16} /> Confirm Delivery
            </button>
          )}
          {canRequestCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <AlertTriangle size={16} /> Request Cancellation
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DeliveryOrderDetail;
