import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * SIMAK FRESH — Circular Ring Preloader
 * White bg. SVG ring fills clockwise in red.
 * Logo + emoji in center. Number counter. Fades out.
 */
const ShrimpLoader = ({ label }: { label?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pct, setPct] = useState(0);

    const R = 54;                        // circle radius
    const CIRC = 2 * Math.PI * R;       // full circumference

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Fade in container
            gsap.fromTo(containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );

            // Drive the ring + counter together
            const obj = { p: 0 };
            gsap.to(obj, {
                p: 100,
                duration: 2,
                ease: "power1.inOut",
                onUpdate: () => setPct(Math.round(obj.p)),
            });

            // Emoji float
            gsap.to(".sf-shrimp", { y: -5, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5 });
            gsap.to(".sf-crab", { y: -4, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.8 });

            // Brand slides up
            gsap.fromTo(".sf-brand",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.3 }
            );

            // Exit fade
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 0.4,
                delay: 2.2,
                ease: "power2.in",
                onComplete: () => {
                    if (containerRef.current) containerRef.current.style.display = "none";
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const dashOffset = CIRC - (pct / 100) * CIRC;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
            {/* Ring + center */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 120 120"
                    fill="none"
                >
                    {/* Track */}
                    <circle cx="60" cy="60" r={R} stroke="#fee2e2" strokeWidth="4" />
                    {/* Fill */}
                    <circle
                        cx="60" cy="60" r={R}
                        stroke="#C8102E"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                </svg>

                {/* Center: emoji stack */}
                <div className="flex flex-col items-center gap-0.5">
                    <span className="sf-shrimp text-2xl select-none" role="img" aria-label="shrimp">🦐</span>
                    <span className="text-[11px] font-black tabular-nums text-cyan-600">{pct}%</span>
                    <span className="sf-crab text-2xl select-none" role="img" aria-label="crab">🦀</span>
                </div>
            </div>

            {/* Brand */}
            <div className="sf-brand flex flex-col items-center gap-1.5">
                <h1 className="text-base font-black tracking-[0.4em] uppercase text-slate-900">
                    SIMAK <span className="text-cyan-600">FRESH</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400 font-medium">
                    {label || "Premium Seafood"}
                </p>
            </div>
        </div>
    );
};

export default ShrimpLoader;