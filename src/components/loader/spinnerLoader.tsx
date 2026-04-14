import React, { useEffect, useRef, useState } from "react";
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
 */
const InitialLoader = ({ label: _label }: { label?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [langIndex, setLangIndex] = useState(0);

    useEffect(() => {
        let timer: number;
        if (langIndex < PRELOADER_TEXTS.length) {
            const delay = langIndex === 0 ? 2500 : 2000;
            timer = window.setTimeout(() => {
                setLangIndex((prev) => prev + 1);
            }, delay);
        } else {
            // Fade out
            timer = window.setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = "0";
                    containerRef.current.style.transition = "opacity 0.8s ease-in-out";
                    setTimeout(() => {
                        if (containerRef.current) containerRef.current.style.display = "none";
                    }, 800);
                }
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [langIndex]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white w-screen h-screen"
        >
            <div className="flex flex-col items-center justify-center gap-8">
                {/* Brand logo icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative"
                >
                    <LogoAnimated className="w-48 h-28 object-contain" />
                </motion.div>

                {/* Animated brand text */}
                <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {langIndex < PRELOADER_TEXTS.length && (
                            <motion.div
                                key={`lang-${langIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="flex flex-col items-center"
                            >
                                {PRELOADER_TEXTS[langIndex]}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Loading bar */}
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

export default InitialLoader;
