import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Confirm",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs sm:max-w-sm relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            onClick={onCancel}
            aria-label="Close"
            disabled={loading}
          >
            <X size={18} />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 bg-rose-50 rounded-full p-3">
              <Trash2 size={32} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && <span className="loader border-white border-t-rose-200 mr-2" style={{ width: 16, height: 16, borderWidth: 2, borderRadius: '50%', display: 'inline-block', borderStyle: 'solid', animation: 'spin 1s linear infinite' }} />}
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmModal;
