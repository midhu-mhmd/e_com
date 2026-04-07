import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, ArrowLeft, Headphones, Loader2 } from "lucide-react";
import { ordersApi } from "../../features/admin/orders/ordersApi";

const PaymentFailed: React.FC = () => {
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order_id") || sessionStorage.getItem("pending_order_id") || localStorage.getItem("pending_order_id");
    if (id) {
      ordersApi.verifyPayment(Number(id)).catch(() => {});
    }
    localStorage.removeItem("pending_order_id");
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || sessionStorage.getItem("pending_order_id") || localStorage.getItem("pending_order_id");
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const handleRetryPayment = async () => {
    if (!orderId) {
      navigate("/checkout");
      return;
    }
    setRetrying(true);
    setRetryError("");
    try {
      const res = await ordersApi.retryPayment(Number(orderId));
      if (res.payment_url) {
        sessionStorage.setItem("pending_order_id", String(orderId));
        window.location.href = res.payment_url;
      }
    } catch (err: any) {
      setRetryError(err?.response?.data?.error || err?.response?.data?.detail || "Failed to retry payment. Please try again.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <AlertTriangle size={48} className="text-red-500" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-red-100 rounded-full"
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-bold text-red-700 tracking-wide uppercase">
            Payment Failed
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
          Payment Unsuccessful
        </h1>

        {orderId && (
          <p className="text-sm font-semibold text-red-500 mb-2">
            Order #{orderId}
          </p>
        )}

        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          We couldn't process your payment. No amount has been charged.
          Please try again or use a different payment method.
        </p>

        {/* Troubleshooting Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-red-100 p-5 mb-8 shadow-sm text-left"
        >
          <p className="text-sm font-bold text-slate-800 mb-3">Common reasons for failure:</p>
          <ul className="space-y-2">
            {[
              "Insufficient balance in your account",
              "Card expired or incorrect details entered",
              "Transaction declined by your bank",
              "Network interruption during payment",
            ].map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-1.5 shrink-0" />
                <span className="text-xs text-slate-500">{reason}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Retry Error */}
        {retryError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 font-semibold mb-4"
          >
            {retryError}
          </motion.p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="group flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retrying ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><RefreshCcw size={16} /> Try Again</>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/support")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-600 transition-colors"
          >
            <Headphones size={14} />
            Contact Support
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
