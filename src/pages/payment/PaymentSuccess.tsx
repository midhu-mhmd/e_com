import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../hooks";
import { clearCart } from "../../features/admin/cart/cartSlice";
import { ordersApi } from "../../features/admin/orders/ordersApi";

const PaymentSuccess: React.FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || sessionStorage.getItem("pending_order_id") || localStorage.getItem("pending_order_id");
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    dispatch(clearCart());
    if (orderId) {
      ordersApi.verifyPayment(Number(orderId)).catch(() => { });
    }
    localStorage.removeItem("pending_order_id");
  }, [dispatch, orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
          >
            <CheckCircle size={48} className="text-emerald-600" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-emerald-100 rounded-full"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
            {t("payment.success.badge")}
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
          {t("payment.success.title")}
        </h1>

        {orderId && (
          <p className="text-lg font-bold text-emerald-600 mb-2">
            {t("payment.success.orderId", { id: orderId })}
          </p>
        )}

        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          {t("payment.success.description")}
        </p>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 shadow-sm"
        >
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-600">{t("payment.success.stepConfirmed")}</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Package size={18} className="text-cyan-600" />
              </div>
              <span className="text-xs font-semibold text-slate-400">{t("payment.success.stepPreparing")}</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <ShoppingBag size={18} className="text-slate-400" />
              </div>
              <span className="text-xs font-semibold text-slate-400">{t("payment.success.stepDelivered")}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="group flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition-all"
          >
            {t("payment.success.viewOrders")}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <Home size={16} />
            {t("payment.success.backHome")}
          </button>
        </div>

        {/* Countdown */}
        <p className="text-xs text-slate-400">
          {t("payment.success.redirect", { count: countdown })}
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
