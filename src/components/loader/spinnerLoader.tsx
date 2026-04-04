
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import simakLogo from "../../assets/SIMAK FRESH FINAL LOGO-01 (1).png";

/**
 * SIMAK FRESH branded preloader.
 */
const InitialLoader = ({ label: _label }: { label?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [langIndex, setLangIndex] = useState(0);
    // 0: English, 1: Chinese, 2: Arabic

    useEffect(() => {
        let timer: number;
        if (langIndex < 2) {
            timer = window.setTimeout(() => {
                setLangIndex((prev) => prev + 1);
            }, 500); // 1.5 seconds per language
        } else if (langIndex === 2) {
            timer = window.setTimeout(() => {
                setLangIndex((prev) => prev + 1);
            }, 1500); // 1.5 seconds for Arabic
        } else if (langIndex === 3) {
            // Fade out after Arabic
            timer = window.setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = "0";
                    containerRef.current.style.transition = "opacity 0.4s ease-in";
                    setTimeout(() => {
                        if (containerRef.current) containerRef.current.style.display = "none";
                    }, 400);
                }
            }, 400); // Short pause after last language
        }
        return () => clearTimeout(timer);
    }, [langIndex]);

    const texts = [
        <span key="en" className="text-sm font-extrabold tracking-tight text-slate-900">
            SIMAK <span className="text-cyan-600">FRESH</span>
        </span>,
        <span key="zh" className="text-sm font-extrabold tracking-tight text-slate-900">
            思马克 <span className="text-cyan-600">新鲜</span>
        </span>,
        <span key="ar" className="text-sm font-extrabold tracking-tight text-slate-900">
            سماك <span className="text-cyan-600">فريش</span>
        </span>,
    ];

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
        >
            <div className="flex flex-col items-center gap-5">
                {/* Brand logo icon — matches navbar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative"
                >
                    <motion.div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 bg-white overflow-hidden"
                        animate={{ boxShadow: [
                            "0 10px 15px -3px rgba(6,182,212,0.25)",
                            "0 10px 25px -3px rgba(6,182,212,0.4)",
                            "0 10px 15px -3px rgba(6,182,212,0.25)",
                        ]}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img src={simakLogo} alt="SIMAK FRESH" className="w-12 h-12 object-contain" />
                    </motion.div>

                    {/* Shrimp orbiting top-right */}
                    <motion.img
                        src="/shrimp.svg"
                        alt="shrimp"
                        className="absolute -top-3 -right-3 w-7 h-7 select-none"
                        animate={{ y: [0, -3, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Crab orbiting bottom-left */}
                    <motion.img
                        src="/crab.svg"
                        alt="crab"
                        className="absolute -bottom-3 -left-3 w-7 h-7 select-none"
                        animate={{ y: [0, 3, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    />

                    {/* Hamour orbiting top-left */}
                    <motion.img
                        src="/hamour.svg"
                        alt="hamour"
                        className="absolute -top-3 -left-3 w-7 h-7 select-none"
                        animate={{ y: [0, -3, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    />

                    {/* Sea bream orbiting bottom-right */}
                    <motion.img
                        src="/seabream.svg"
                        alt="sea bream"
                        className="absolute -bottom-3 -right-3 w-7 h-7 select-none"
                        animate={{ y: [0, 3, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                    />
                </motion.div>

                {/* Animated brand text, one at a time */}
                {langIndex <= 2 && (
                    <motion.div
                        key={langIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col items-center gap-1"
                    >
                        {texts[langIndex]}
                    </motion.div>
                )}

                {/* Thin loading bar */}
                <div className="h-0.5 w-14 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                        className="h-full w-5 rounded-full bg-cyan-500"
                        animate={{ x: ["-20%", "200%"] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InitialLoader;
