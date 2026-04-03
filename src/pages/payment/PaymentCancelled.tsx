import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, ShoppingCart, RefreshCcw } from "lucide-react";

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
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
          className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-8"
        >
          <XCircle size={48} className="text-amber-600" strokeWidth={1.5} />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-amber-100 rounded-full"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-amber-700 tracking-wide uppercase">
            Payment Cancelled
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
          Payment Was Cancelled
        </h1>

        {orderId && (
          <p className="text-sm font-semibold text-amber-600 mb-2">
            Order #{orderId}
          </p>
        )}

        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          Your payment was cancelled and no charges were made.
          Your cart items are still saved — you can try again whenever you're ready.
        </p>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-amber-100 p-5 mb-8 shadow-sm"
        >
          <div className="flex items-start gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mt-0.5 shrink-0">
              <RefreshCcw size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">Want to try again?</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Go back to checkout to complete your purchase. You can also change
                your payment method to Cash on Delivery.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/checkout")}
            className="group flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition-all"
          >
            <RefreshCcw size={16} />
            Retry Payment
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <ShoppingCart size={16} />
            View Cart
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancelled;
