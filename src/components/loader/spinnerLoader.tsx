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
 * SIMAK FRESH branded initial preloader.
 * Advanced animation: fish merge + ripple particles + fast multilingual cycle.
 * Total duration: ~3.5 seconds.
 */
const InitialLoader = ({ label: _label }: { label?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [langIndex, setLangIndex] = useState(0);
    const [showParticles, setShowParticles] = useState(false);

    // Trigger particles after fish merge completes
    useEffect(() => {
        const timer = setTimeout(() => setShowParticles(true), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let timer: number;
        if (langIndex < PRELOADER_TEXTS.length) {
            const delay = langIndex === 0 ? 1400 : 800;
            timer = window.setTimeout(() => {
                setLangIndex((prev) => prev + 1);
            }, delay);
        } else {
            timer = window.setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = "0";
                    containerRef.current.style.transition = "opacity 0.5s ease-in-out";
                    setTimeout(() => {
                        if (containerRef.current) containerRef.current.style.display = "none";
                    }, 500);
                }
            }, 300);
        }
        return () => clearTimeout(timer);
    }, [langIndex]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white w-screen h-screen overflow-hidden"
        >
            {/* Subtle radial gradient backdrop */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 60%)",
                }}
            />

            {/* Expanding ripple rings triggered after merge */}
            <AnimatePresence>
                {showParticles && (
                    <>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={`ring-${i}`}
                                initial={{ opacity: 0.3, scale: 0.3 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                exit={{ opacity: 0 }}
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
                {/* Brand logo icon — cinematic fish merge animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative"
                >
                    <LogoAnimated className="w-48 h-28 object-contain" mergeDuration={1.0} />
                </motion.div>

                {/* Animated brand text — quick multilingual cycle */}
                <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {langIndex < PRELOADER_TEXTS.length && (
                            <motion.div
                                key={`lang-${langIndex}`}
                                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex flex-col items-center"
                            >
                                {PRELOADER_TEXTS[langIndex]}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Advanced progress bar — fill instead of bounce */}
                <div className="h-[3px] w-36 overflow-hidden rounded-full bg-slate-100/80 mt-1">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: "linear-gradient(90deg, #06b6d4, #0891b2, #06b6d4)",
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 3.2,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InitialLoader;
