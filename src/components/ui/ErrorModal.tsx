import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

/* ── Types ── */
interface ErrorModalState {
    isOpen: boolean;
    message: string;
}

interface ErrorModalContextValue {
    showError: (message: string) => void;
}

const ErrorModalContext = createContext<ErrorModalContextValue | null>(null);

export const useErrorModal = () => {
    const ctx = useContext(ErrorModalContext);
    if (!ctx) throw new Error("useErrorModal must be inside ErrorModalProvider");
    return ctx;
};

/* ── Helper: extract readable message from 400 response ── */
function extractErrorMessage(data: any): string {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    // Django-style field errors: { field: ["msg", ...] }
    if (typeof data === "object") {
        const messages: string[] = [];
        for (const key of Object.keys(data)) {
            const val = data[key];
            if (Array.isArray(val)) {
                messages.push(...val.map((v: any) => (typeof v === "string" ? v : JSON.stringify(v))));
            } else if (typeof val === "string") {
                messages.push(val);
            }
        }
        if (messages.length) return messages.join("\n");
    }

    return "Something went wrong. Please try again.";
}

/* ── Provider ── */
export const ErrorModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation("common");
    const [modal, setModal] = useState<ErrorModalState>({ isOpen: false, message: "" });

    const showError = useCallback((message: string) => {
        setModal({ isOpen: true, message });
    }, []);

    const close = useCallback(() => {
        setModal({ isOpen: false, message: "" });
    }, []);

    // Listen for custom event dispatched from the axios interceptor
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const msg = extractErrorMessage(detail);
            showError(msg);
        };
        window.addEventListener("api-error-400", handler);
        return () => window.removeEventListener("api-error-400", handler);
    }, [showError]);

    return (
        <ErrorModalContext.Provider value={{ showError }}>
            {children}

            {/* ── Modal Overlay ── */}
            <AnimatePresence>
                {modal.isOpen && (
                    <div className="fixed inset-0 z-9 lxitems-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={close}
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 24 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
                        >
                            {/* Top Accent Bar */}
                            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />

                            {/* Close Button */}
                            <button
                                onClick={close}
                                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {/* Content */}
                            <div className="px-6 pt-6 pb-7 text-center">
                                {/* Icon */}
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 ring-4 ring-rose-100/60">
                                    <AlertTriangle size={28} className="text-rose-500" />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                                    {t("errors.modal.requestError")}
                                </h3>
                                <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-4">
                                    {t("errors.modal.badRequest")}
                                </p>

                                {/* Error Message */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-6">
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line break-words">
                                        {modal.message}
                                    </p>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={close}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                                >
                                    {t("errors.modal.dismiss")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ErrorModalContext.Provider>
    );
};
