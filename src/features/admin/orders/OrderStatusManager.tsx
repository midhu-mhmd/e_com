import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { OrderDto, ordersApi } from "./ordersApi";

interface OrderStatusManagerProps {
  order: OrderDto;
  onStatusUpdate?: (updatedOrder: OrderDto) => void;
}

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  order,
  onStatusUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status && !notes) {
      setError("Please select a new status or add notes");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedOrder = await ordersApi.updateStatus(
        order.id,
        selectedStatus,
        notes || undefined
      );
      setSuccess(true);
      setNotes("");
      onStatusUpdate?.(updatedOrder);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update order status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-4">
        Update Order Status
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={16} />
          Status updated successfully
        </div>
      )}

      <div className="space-y-4">
        {/* Current Status Badge */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Current Status
          </p>
          <div className="inline-block">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {order.status}
            </span>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            New Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            Status Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this status change..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={3}
          />
        </div>

        {/* Status History */}
        {order.status_history && order.status_history.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Status History
            </p>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {order.status_history.map((history, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 p-3 last:border-b-0 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {history.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(history.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-xs text-gray-600">{history.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Update Button */}
        <button
          onClick={handleStatusUpdate}
          disabled={loading || selectedStatus === order.status}
          className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderStatusManager;
