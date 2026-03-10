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

/* ── Component ── */
const HowItWorksSection: React.FC = () => {
    const { t } = useTranslation("home");

    const steps = [
        {
            number: "01",
            icon: <Search size={28} />,
            title: t("howItWorks.steps.0.title"),
            description: t("howItWorks.steps.0.description"),
            detail: t("howItWorks.steps.0.detail"),
            bg: "bg-cyan-50",
            accent: "text-cyan-600",
        },
        {
            number: "02",
            icon: <ShoppingBag size={28} />,
            title: t("howItWorks.steps.1.title"),
            description: t("howItWorks.steps.1.description"),
            detail: t("howItWorks.steps.1.detail"),
            bg: "bg-yellow-50",
            accent: "text-amber-800",
        },
        {
            number: "03",
            icon: <Truck size={28} />,
            title: t("howItWorks.steps.2.title"),
            description: t("howItWorks.steps.2.description"),
            detail: t("howItWorks.steps.2.detail"),
            bg: "bg-cyan-50",
            accent: "text-cyan-600",
        },
        {
            number: "04",
            icon: <UtensilsCrossed size={28} />,
            title: t("howItWorks.steps.3.title"),
            description: t("howItWorks.steps.3.description"),
            detail: t("howItWorks.steps.3.detail"),
            bg: "bg-yellow-50",
            accent: "text-amber-800",
        },
    ];

    return (
        <section className="relative bg-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Decorative waves */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-white" />
            <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-[0.03]">
                <Waves size={600} strokeWidth={0.5} />
            </div>

            <div className="relative mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full mb-4">
                        <Waves size={14} className="text-cyan-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                            {t("howItWorks.kicker")}
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        {t("howItWorks.title")}{" "}
                        <span className="text-cyan-600">
                            {t("howItWorks.titleHighlight")}
                        </span>
                    </h2>
                    <p className="mt-4 text-zinc-500 text-sm max-w-lg mx-auto leading-relaxed">
                        {t("howItWorks.subtitle")}
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-[2px]">
                        <div className="w-full h-full bg-cyan-100 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                        {steps.map((step, i) => (
                            <StepCard key={i} step={step} index={i} isLast={i === steps.length - 1} />
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <button
                        className="group inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:bg-cyan-700 transition-all duration-300 active:scale-[0.98]"
                        onClick={() => navigateTo('/products')}
                    >
                        {t("howItWorks.cta")}
                        <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </button>
                    <p className="mt-3 text-[11px] text-zinc-400">
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
    title: string;
    description: string;
    detail: string;
    bg: string;
    accent: string;
}

const StepCard: React.FC<{ step: StepData; index: number; isLast: boolean }> = ({
    step,
    index,
    isLast,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) setVisible(true);
            },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`relative flex flex-col items-center text-center transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            style={{ transitionDelay: `${index * 120}ms` }}
        >
            {/* Step number */}
            <div className="relative z-10 mb-5">
                {/* Glow ring */}
                <div
                    className={`absolute -inset-3 rounded-full ${index % 2 === 0 ? 'bg-cyan-400' : 'bg-yellow-500'} opacity-20 blur-md transition-all duration-500 group-hover:opacity-30`}
                />

                {/* Icon circle */}
                <div
                    className={`relative w-[72px] h-[72px] rounded-2xl ${index % 2 === 0 ? 'bg-cyan-600' : 'bg-yellow-500'} text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-default`}
                >
                    {step.icon}
                </div>

                {/* Number badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-extrabold text-zinc-700">
                        {step.number}
                    </span>
                </div>
            </div>

            {/* Arrow connector (mobile/tablet between cards) */}
            {!isLast && (
                <div className="lg:hidden flex justify-center my-2">
                    <ChevronRight size={16} className="text-zinc-300 rotate-90" />
                </div>
            )}

            {/* Text */}
            <h3 className="text-sm font-bold text-zinc-900 mb-2">{step.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px] mb-3">
                {step.description}
            </p>

            {/* Detail tag */}
            <div className={`inline-flex px-3 py-1 ${step.bg} rounded-lg`}>
                <span className={`text-[10px] font-bold ${step.accent}`}>
                    {step.detail}
                </span>
            </div>
        </div>
    );
};

export default HowItWorksSection;
