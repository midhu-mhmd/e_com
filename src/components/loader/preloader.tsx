import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * SIMAK FRESH branded preloader.
 */
const ShrimpLoader = ({ label: _label }: { label?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.style.opacity = "0";
                containerRef.current.style.transition = "opacity 0.4s ease-in";
                setTimeout(() => {
                    if (containerRef.current) containerRef.current.style.display = "none";
                }, 400);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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
                        className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
                        animate={{ boxShadow: [
                            "0 10px 15px -3px rgba(6,182,212,0.25)",
                            "0 10px 25px -3px rgba(6,182,212,0.4)",
                            "0 10px 15px -3px rgba(6,182,212,0.25)",
                        ]}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className="text-white font-black text-2xl leading-none">S</span>
                    </motion.div>

                    {/* Shrimp orbiting top-right */}
                    <motion.span
                        className="absolute -top-2 -right-2 text-xs select-none"
                        role="img"
                        aria-label="shrimp"
                        animate={{ y: [0, -3, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🦐
                    </motion.span>

                    {/* Crab orbiting bottom-left */}
                    <motion.span
                        className="absolute -bottom-2 -left-2 text-xs select-none"
                        role="img"
                        aria-label="crab"
                        animate={{ y: [0, 3, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    >
                        🦀
                    </motion.span>
                </motion.div>

                {/* Brand text */}
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                    className="text-sm font-extrabold tracking-tight text-slate-900"
                >
                    SIMAK <span className="text-cyan-600">FRESH</span>
                </motion.p>

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

export default ShrimpLoader;