import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingCart, X, Info, AlertTriangle } from "lucide-react";
import { BRAND_COLORS } from "../../constants/theme";

type ToastType = "success" | "cart" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  cart: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check size={16} strokeWidth={3} style={{ color: BRAND_COLORS.CYAN }} />,
  cart: <ShoppingCart size={16} strokeWidth={2.5} style={{ color: BRAND_COLORS.CYAN }} />,
  error: <X size={16} strokeWidth={3} style={{ color: BRAND_COLORS.RED }} />,
  info: <Info size={16} strokeWidth={2.5} className="text-blue-500" />,
  warning: <AlertTriangle size={16} strokeWidth={2.5} className="text-amber-500" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-white/95 backdrop-blur-md border-cyan-100/50 text-cyan-950 shadow-xl shadow-cyan-950/5",
  cart: "bg-white/95 backdrop-blur-md border-cyan-100/50 text-cyan-950 shadow-xl shadow-cyan-950/5",
  error: "bg-white/95 backdrop-blur-md border-red-100/50 text-red-950 shadow-xl shadow-red-950/5",
  info: "bg-white/95 backdrop-blur-md border-blue-100/50 text-blue-950 shadow-xl shadow-blue-950/5",
  warning: "bg-white/95 backdrop-blur-md border-amber-100/50 text-amber-950 shadow-xl shadow-amber-950/5",
};

const TOAST_ACCENTS: Record<ToastType, string> = {
  success: BRAND_COLORS.CYAN,
  cart: BRAND_COLORS.CYAN,
  error: BRAND_COLORS.RED,
  info: "#3b82f6",
  warning: "#f59e0b",
};

const SeaWave = ({ type }: { type: ToastType }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute bottom-0 left-0 right-0 h-4 opacity-[0.25]">
      <motion.svg
        viewBox="0 0 120 28"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-[200%] h-full"
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        fill={TOAST_ACCENTS[type]}
      >
        <path d="M0 15 Q30 5 60 15 T120 15 V28 H0 Z" />
      </motion.svg>
    </div>

    { (type === "success" || type === "cart") && (
      <motion.div
        className="absolute right-8 bottom-[-4px]"
        initial={{ y: 20, opacity: 0, rotate: -30 }}
        animate={{
          y: [15, -18, 15],
          opacity: [0, 1, 0],
          rotate: [-30, 0, 30],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatDelay: 2.8,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <motion.path
            d="M1 9 L5 5 L9 9"
            fill={BRAND_COLORS.GOLD}
            animate={{ y: [0, -4, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="5" cy="11.5" r="0.8" fill={BRAND_COLORS.CYAN} opacity="0.8" />
        </svg>
      </motion.div>
    )}
  </div>
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const success = useCallback((message: string) => show(message, "success"), [show]);
  const error = useCallback((message: string) => show(message, "error"), [show]);
  const cart = useCallback((message: string) => show(message, "cart"), [show]);
  const info = useCallback((message: string) => show(message, "info"), [show]);
  const warning = useCallback((message: string) => show(message, "warning"), [show]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ message: string; type?: ToastType }>;
      if (ev?.detail?.message) {
        show(ev.detail.message, ev.detail.type || "success");
      }
    };
    window.addEventListener("app:toast" as any, handler as any);
    return () => window.removeEventListener("app:toast" as any, handler as any);
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, cart, info, warning }}>
      {children}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8, filter: "blur(2px)" }}
              transition={{ type: "spring", stiffness: 600, damping: 25 }}
              className="pointer-events-auto"
            >
              <div
                onClick={() => dismiss(toast.id)}
                className={`relative overflow-hidden flex items-center gap-3 px-5 py-2.5 rounded-full border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${TOAST_STYLES[toast.type]}`}
              >
                <SeaWave type={toast.type} />
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
                  {TOAST_ICONS[toast.type]}
                </div>
                <span className="relative z-10 text-[14px] font-medium tracking-tight pr-1">
                  {toast.message}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const emitToast = (message: string, type: ToastType = "success") => {
  try {
    const ev = new CustomEvent("app:toast", { detail: { message, type } });
    window.dispatchEvent(ev);
  } catch { }
};
