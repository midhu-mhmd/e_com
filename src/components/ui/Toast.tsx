import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingCart, X } from "lucide-react";

/* ── Types ── */
type ToastType = "success" | "cart" | "error";

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
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be inside ToastProvider");
    return ctx;
};

/* ── Bright Minimalist Pill ── */
const icons: Record<ToastType, React.ReactNode> = {
    success: <Check size={16} strokeWidth={3} className="text-emerald-500" />,
    cart: <ShoppingCart size={16} strokeWidth={2.5} className="text-blue-500" />,
    error: <X size={16} strokeWidth={3} className="text-red-500" />,
};

const styles: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    cart: "bg-blue-50 border-blue-100 text-blue-800",
    error: "bg-red-50 border-red-100 text-red-800",
};

/* ── Provider ── */
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

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    React.useEffect(() => {
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
        <ToastContext.Provider value={{ show, success, error, cart }}>
            {children}

            {/* Toast container — top center, tightly spaced */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 pointer-events-none items-center">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
                            transition={{ type: "spring", stiffness: 600, damping: 25 }}
                            className="pointer-events-auto"
                        >
                            <div
                                onClick={() => dismiss(toast.id)}
                                className={`flex items-center gap-3 px-5 py-2.5 rounded-full border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${styles[toast.type]}`}
                            >
                                <div className="flex-shrink-0 flex items-center justify-center">
                                    {icons[toast.type]}
                                </div>
                                <span className="text-[14px] font-medium tracking-tight pr-1">
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
    } catch {}
};
