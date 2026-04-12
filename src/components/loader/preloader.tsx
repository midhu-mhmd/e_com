import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoAnimated from "../ui/LogoAnimated";

const PRELOADER_TEXTS = [
    <span key="en" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        SIMAK <span className="text-cyan-600/50">FRESH</span>
    </span>,
    <span key="zh" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        思马克 <span className="text-cyan-600/50">新鲜</span>
    </span>,
    <span key="ar" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans">
        سماك <span className="text-cyan-600/50">فريش</span>
    </span>,
];

/**
 * SIMAK FRESH branded preloader.
 * Shown during internal page loading states with a blurred background overlay.
 */
const ShrimpLoader = () => {
    const [langIndex, setLangIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setLangIndex((prev) => (prev + 1) % 3);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-5">
                {/* Brand logo icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative"
                >
                    <motion.div
                        className="w-80 h-48 flex items-center justify-center"
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <LogoAnimated className="w-full h-full" />
                    </motion.div>
                </motion.div>

                {/* Brand text with Animation */}
                <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`pre-lang-${langIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="flex flex-col items-center"
                        >
                            {PRELOADER_TEXTS[langIndex]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Thin loading bar */}
                <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-100 mt-2">
                    <motion.div
                        className="h-full w-12 rounded-full bg-cyan-500"
                        animate={{ x: ["-20%", "250%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShrimpLoader;
