import React, { useEffect, useRef, useState } from "react";
import {
    Snowflake,
    Timer,
    Anchor,
    Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ── Component ── */
const FreshnessSection: React.FC = () => {
    const { t } = useTranslation("home");

    const promises = [
        {
            icon: <Anchor size={20} />,
            title: t("freshness.promises.0.title"),
            desc: t("freshness.promises.0.desc"),
            stat: t("freshness.promises.0.stat"),
            statLabel: t("freshness.promises.0.statLabel"),
            accent: "bg-cyan-600",
        },
        {
            icon: <Snowflake size={20} />,
            title: t("freshness.promises.1.title"),
            desc: t("freshness.promises.1.desc"),
            stat: t("freshness.promises.1.stat"),
            statLabel: t("freshness.promises.1.statLabel"),
            accent: "bg-cyan-500",
        },
        {
            icon: <Timer size={20} />,
            title: t("freshness.promises.2.title"),
            desc: t("freshness.promises.2.desc"),
            stat: t("freshness.promises.2.stat"),
            statLabel: t("freshness.promises.2.statLabel"),
            accent: "bg-cyan-600",
        },
        {
            icon: <Award size={20} />,
            title: t("freshness.promises.3.title"),
            desc: t("freshness.promises.3.desc"),
            stat: t("freshness.promises.3.stat"),
            statLabel: t("freshness.promises.3.statLabel"),
            accent: "bg-cyan-500",
        },
    ];

    return (
        <section className="relative bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background decoration */}
            <div className="pointer-events-none absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-cyan-50/40 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-60 sm:w-[400px] h-60 sm:h-[400px] bg-yellow-50/30 rounded-full blur-3xl" />

            <div className="relative mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full mb-3 sm:mb-4">
                        <Snowflake size={13} className="text-cyan-500" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-cyan-600">
                            {t("freshness.kicker")}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                        {t("freshness.title")}{" "}
                        <span className="text-cyan-600">{t("freshness.titleHighlight")}</span>
                    </h2>

                    <p className="mt-3 text-zinc-500 text-xs sm:text-sm max-w-xs sm:max-w-lg mx-auto leading-relaxed">
                        {t("freshness.subtitle")}
                    </p>
                </div>

                {/* Promise Cards — 2 col mobile / 2 col tablet / 4 col desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {promises.map((p, i) => (
                        <PromiseCard key={i} promise={p} index={i} />
                    ))}
                </div>

                {/* Footer note */}
                <p className="mt-6 sm:mt-8 text-center text-[11px] sm:text-xs text-zinc-400 font-medium">
                    {t("freshness.footerCTA")}
                </p>
            </div>
        </section>
    );
};

/* ── Promise Card ── */
interface PromiseData {
    icon: React.ReactNode;
    title: string;
    desc: string;
    stat: string;
    statLabel: string;
    accent: string;
}

const PromiseCard: React.FC<{ promise: PromiseData; index: number }> = ({
    promise,
    index,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`group flex flex-col bg-white border border-zinc-100 rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 90}ms` }}
        >
            {/* Icon */}
            <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${promise.accent} text-white flex items-center justify-center shadow-md mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0`}
            >
                {promise.icon}
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug mb-1">
                {promise.title}
            </h3>

            {/* Desc — only on md+ */}
            <p className="hidden md:block text-xs text-zinc-500 leading-relaxed flex-1 mb-3">
                {promise.desc}
            </p>

            {/* Stat */}
            <div className="mt-auto pt-3 border-t border-zinc-100">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-yellow-500 leading-none">
                    {promise.stat}
                </span>
                <span className="block text-[10px] sm:text-xs text-zinc-400 font-medium mt-1 leading-tight">
                    {promise.statLabel}
                </span>
            </div>
        </div>
    );
};

export default FreshnessSection;
