import React, { useEffect, useRef, useState } from "react";
import {
    Snowflake,
    Timer,
    Anchor,
    Award,
    ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ── Component ── */
const FreshnessSection: React.FC = () => {
    const { t } = useTranslation("home");

    const promises = [
        {
            icon: <Anchor size={22} />,
            title: t("freshness.promises.0.title"),
            desc: t("freshness.promises.0.desc"),
            stat: t("freshness.promises.0.stat"),
            statLabel: t("freshness.promises.0.statLabel"),
        },
        {
            icon: <Snowflake size={22} />,
            title: t("freshness.promises.1.title"),
            desc: t("freshness.promises.1.desc"),
            stat: t("freshness.promises.1.stat"),
            statLabel: t("freshness.promises.1.statLabel"),
        },
        {
            icon: <Timer size={22} />,
            title: t("freshness.promises.2.title"),
            desc: t("freshness.promises.2.desc"),
            stat: t("freshness.promises.2.stat"),
            statLabel: t("freshness.promises.2.statLabel"),
        },
        {
            icon: <Award size={22} />,
            title: t("freshness.promises.3.title"),
            desc: t("freshness.promises.3.desc"),
            stat: t("freshness.promises.3.stat"),
            statLabel: t("freshness.promises.3.statLabel"),
        },
    ];


    return (
        <section className="relative bg-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background decoration */}
            <div className="pointer-events-none absolute top-20 right-0 w-[500px] h-[500px] bg-cyan-50/30 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-0 w-[400px] h-[400px] bg-yellow-50/20 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full mb-4">
                        <Snowflake size={14} className="text-cyan-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">
                            {t("freshness.kicker")}
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        {t("freshness.title")}{" "}
                        <span className="text-cyan-600">
                            {t("freshness.titleHighlight")}
                        </span>
                    </h2>
                    <p className="mt-4 text-zinc-500 text-sm max-w-lg mx-auto leading-relaxed">
                        {t("freshness.subtitle")}
                    </p>
                </div>

                {/* Promise Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {promises.map((p, i) => (
                        <PromiseCard key={i} promise={p} index={i} />
                    ))}
                </div>

                <div className="text-center mt-10">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 sm:py-3 bg-yellow-50 border border-yellow-100 rounded-2xl w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <Snowflake size={18} className="text-yellow-600" />
                            <span className="text-sm font-bold text-zinc-700">
                                {t("freshness.footerCTA")}
                            </span>
                        </div>
                        <ArrowRight size={16} className="text-yellow-500 hidden sm:block" />
                    </div>
                </div>
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
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`group relative bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col items-center text-center sm:items-start sm:text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-default ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300 sm:mx-0">
                {promise.icon}
            </div>

            <h3 className="text-sm font-bold text-zinc-900 mb-1.5">{promise.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">{promise.desc}</p>

            <div className="pt-4 border-t border-zinc-100 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-yellow-500">
                    {promise.stat}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">{promise.statLabel}</span>
            </div>
        </div>
    );
};

export default FreshnessSection;
