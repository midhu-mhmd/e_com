import React, { useEffect, useRef, useState } from "react";
import {
    Search,
    ShoppingBag,
    Truck,
    UtensilsCrossed,
    ChevronRight,
    Waves,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { navigateTo } from '../../utils/navigate';

const HowItWorksSection: React.FC = () => {
    const { t } = useTranslation("home");

    const steps = [
        {
            number: "01",
            icon: <Search size={28} />,
            smallIcon: <Search size={18} />,
            title: t("howItWorks.steps.0.title"),
            description: t("howItWorks.steps.0.description"),
            detail: t("howItWorks.steps.0.detail"),
            bg: "bg-cyan-50",
            accent: "text-cyan-600",
            color: "bg-cyan-600",
            glow: "bg-cyan-400",
        },
        {
            number: "02",
            icon: <ShoppingBag size={28} />,
            smallIcon: <ShoppingBag size={18} />,
            title: t("howItWorks.steps.1.title"),
            description: t("howItWorks.steps.1.description"),
            detail: t("howItWorks.steps.1.detail"),
            bg: "bg-yellow-50",
            accent: "text-amber-700",
            color: "bg-amber-500",
            glow: "bg-yellow-400",
        },
        {
            number: "03",
            icon: <Truck size={28} />,
            smallIcon: <Truck size={18} />,
            title: t("howItWorks.steps.2.title"),
            description: t("howItWorks.steps.2.description"),
            detail: t("howItWorks.steps.2.detail"),
            bg: "bg-cyan-50",
            accent: "text-cyan-600",
            color: "bg-cyan-600",
            glow: "bg-cyan-400",
        },
        {
            number: "04",
            icon: <UtensilsCrossed size={28} />,
            smallIcon: <UtensilsCrossed size={18} />,
            title: t("howItWorks.steps.3.title"),
            description: t("howItWorks.steps.3.description"),
            detail: t("howItWorks.steps.3.detail"),
            bg: "bg-yellow-50",
            accent: "text-amber-700",
            color: "bg-amber-500",
            glow: "bg-yellow-400",
        },
    ];

    return (
        <section className="relative bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Decorative */}
            <div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-[0.03]">
                <Waves size={500} strokeWidth={0.5} />
            </div>

            <div className="relative mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full mb-3 sm:mb-4">
                        <Waves size={13} className="text-cyan-500" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                            {t("howItWorks.kicker")}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                        {t("howItWorks.title")}{" "}
                        <span className="text-cyan-600">{t("howItWorks.titleHighlight")}</span>
                    </h2>
                    <p className="mt-3 text-zinc-500 text-xs sm:text-sm max-w-xs sm:max-w-lg mx-auto leading-relaxed">
                        {t("howItWorks.subtitle")}
                    </p>
                </div>

                {/* Steps — 2 col mobile / 2 col tablet / 4 col desktop */}
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-6">
                    {/* Connecting line — desktop only */}
                    <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-cyan-100 rounded-full z-0" />

                    {steps.map((step, i) => (
                        <StepCard key={i} step={step} index={i} />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-8 sm:mt-10">
                    <button
                        className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-cyan-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:bg-cyan-700 transition-all duration-300 active:scale-[0.98]"
                        onClick={() => navigateTo('/products')}
                    >
                        {t("howItWorks.cta")}
                        <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className="mt-2.5 text-[10px] sm:text-[11px] text-zinc-400">
                        {t("howItWorks.freeDelivery")}
                    </p>
                </div>
            </div>
        </section>
    );
};

/* ── Step Card ── */
interface StepData {
    number: string;
    icon: React.ReactNode;
    smallIcon: React.ReactNode;
    title: string;
    description: string;
    detail: string;
    bg: string;
    accent: string;
    color: string;
    glow: string;
}

const StepCard: React.FC<{ step: StepData; index: number }> = ({ step, index }) => {
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
            className={`relative z-10 flex flex-col items-center text-center p-4 sm:p-5 bg-white border border-zinc-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Icon */}
            <div className="relative mb-3 sm:mb-4">
                {/* Glow — sm+ only */}
                <div className={`hidden sm:block absolute -inset-3 rounded-full ${step.glow} opacity-20 blur-md`} />
                <div
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${step.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                    <span className="sm:hidden">{step.smallIcon}</span>
                    <span className="hidden sm:block">{step.icon}</span>
                </div>
                {/* Number badge */}
                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[8px] sm:text-[10px] font-extrabold text-zinc-700">{step.number}</span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-[11px] sm:text-sm font-bold text-zinc-900 mb-1 sm:mb-2 leading-tight">
                {step.title}
            </h3>

            {/* Description — md+ only */}
            <p className="hidden md:block text-xs text-zinc-500 leading-relaxed mb-3">
                {step.description}
            </p>

            {/* Detail chip */}
            <div className={`mt-auto inline-flex px-2 sm:px-3 py-1 ${step.bg} rounded-lg`}>
                <span className={`text-[9px] sm:text-[10px] font-bold ${step.accent} leading-tight`}>
                    {step.detail}
                </span>
            </div>
        </div>
    );
};

export default HowItWorksSection;
