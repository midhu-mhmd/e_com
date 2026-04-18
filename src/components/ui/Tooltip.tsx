import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <div
        className="relative inline-block"
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              style={{
                position: "fixed",
                top: coords.top - 12,
                left: coords.left,
                transform: "translate(-50%, -100%)",
                zIndex: 999999,
              }}
              className="px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-bold leading-relaxed shadow-2xl pointer-events-none w-max max-w-[200px] text-center"
            >
              <span className="relative z-10">{text}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
