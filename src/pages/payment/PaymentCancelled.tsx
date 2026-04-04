import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Package } from "lucide-react";

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || sessionStorage.getItem("pending_order_id");

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4 py-10 sm:p-6">
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
          className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 sm:mb-8"
        >
          <Clock size={40} className="text-amber-600 sm:hidden" strokeWidth={1.5} />
          <Clock size={48} className="text-amber-600 hidden sm:block" strokeWidth={1.5} />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 bg-amber-100 rounded-full"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase">
            Order Pending
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3">
          Your Order Is Marked as Pending
        </h1>

        {orderId && (
          <p className="text-sm font-semibold text-amber-600 mb-2">
            Order #{orderId}
          </p>
        )}

        <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
          Your payment was cancelled but your order has been saved as pending.
          You can return to your order at any time to complete the payment.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={() => navigate(orderId ? `/orders/${orderId}` : "/orders")}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition-all"
          >
            <Package size={16} />
            Return to Order
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-50 transition-all"
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
