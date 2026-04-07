import { motion } from "framer-motion";
import simakLogo from "../../assets/SIMAK FRESH FINAL SVG-01.svg";

/**
 * SIMAK FRESH branded preloader.
 * Shown during internal page loading states with a blurred background overlay.
 */
const ShrimpLoader = () => {
    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-sm"
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
                        animate={{
                            boxShadow: [
                                "0 10px 15px -3px rgba(6,182,212,0.25)",
                                "0 10px 25px -3px rgba(6,182,212,0.4)",
                                "0 10px 15px -3px rgba(6,182,212,0.25)",
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img src={simakLogo} alt="SIMAK FRESH" className="w-12 h-12 object-contain" />
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
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShrimpLoader;