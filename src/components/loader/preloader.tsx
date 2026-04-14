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
    const [showRings, setShowRings] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowRings(true), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setLangIndex((prev) => (prev + 1) % 3);
        }, 1200);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-sm w-screen h-screen overflow-hidden">
            {/* Ripple rings */}
            <AnimatePresence>
                {showRings && (
                    <>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={`ring-${i}`}
                                initial={{ opacity: 0.25, scale: 0.3 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.4,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                                className="absolute w-48 h-48 rounded-full border border-cyan-300/20 pointer-events-none"
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            <div className="relative flex flex-col items-center justify-center gap-8">
                {/* Brand logo — cinematic fish merge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative"
                >
                    <LogoAnimated className="w-64 h-40 object-contain" mergeDuration={1.0} />
                </motion.div>

                {/* Brand text with blur transitions */}
                <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`pre-lang-${langIndex}`}
                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col items-center"
                        >
                            {PRELOADER_TEXTS[langIndex]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress shimmer bar */}
                <div className="h-[3px] w-36 overflow-hidden rounded-full bg-slate-100/80 mt-1">
                    <motion.div
                        className="h-full w-12 rounded-full"
                        style={{
                            background: "linear-gradient(90deg, transparent, #06b6d4, transparent)",
                        }}
                        animate={{ x: ["-100%", "400%"] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShrimpLoader;
