import React from "react";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    ArrowRight,
    CreditCard,
    Smartphone,
    Banknote,
    ShieldCheck,
} from "lucide-react";


import { useTranslation } from "react-i18next";
import simakLogo from "../../../assets/SIMAK FRESH FINAL SVG-01.svg";

/* ── Component ── */
const Footer: React.FC = () => {
    const { t } = useTranslation("common");
    const year = new Date().getFullYear();

    const shopLinks = t("footer.shopLinks", { returnObjects: true }) as { label: string }[];
    const companyLinks = t("footer.companyLinks", { returnObjects: true }) as { label: string }[];
    const supportLinks = t("footer.supportLinks", { returnObjects: true }) as { label: string }[];
    const legalLinks = t("footer.legalLinks", { returnObjects: true }) as { label: string }[];

    const socials = [
        { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
        { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
        { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
        { icon: <Youtube size={18} />, href: "#", label: "YouTube" },
    ];

    return (
        <footer className="bg-cyan-950 text-cyan-200/80">
            {/* Newsletter Banner */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-cyan-900 border border-cyan-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {t("footer.newsletter.title")}
                            </h3>
                            <p className="text-xs text-cyan-200/60">
                                {t("footer.newsletter.subtitle")}
                            </p>
                        </div>
                        <div className="relative flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                            <input
                                type="email"
                                placeholder={t("footer.newsletter.placeholder")}
                                className="w-full sm:w-64 px-4 py-3 bg-cyan-950/50 border border-cyan-800 rounded-xl text-sm text-white placeholder:text-cyan-300/50 focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <button className="w-full sm:w-auto px-5 py-3 bg-yellow-500 text-cyan-900 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/25 active:scale-[0.98] flex items-center justify-center gap-1.5">
                                {t("footer.newsletter.subscribe")}
                                <ArrowRight size={14} className="rtl-flip" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Grid */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                        {/* Brand Column */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                    <img
                                        src={simakLogo}
                                        alt={t('brand.name')}
                                        className="h-7 w-7 object-contain"
                                    />
                                </div>
                                <span className="text-lg font-extrabold text-white tracking-tight">
                                    {t('brand.name')}
                                </span>
                            </div>
                            <p className="text-xs text-cyan-200/60 leading-relaxed mb-5 max-w-xs">
                                {t("footer.brandDescription")}
                            </p>

                            {/* Contact */}
                            <div className="space-y-2.5 mb-6">
                                <a href="tel:+919876543210" className="flex items-center gap-2.5 text-xs hover:text-yellow-400 transition-colors">
                                    <Phone size={13} className="text-cyan-300" />
                                    +91 98765 43210
                                </a>
                                <a href="mailto:hello@simakfresh.ae" className="flex items-center gap-2.5 text-xs hover:text-yellow-400 transition-colors">
                                    <Mail size={13} className="text-cyan-300" />
                                    hello@simakfresh.ae
                                </a>
                                <div className="flex items-center gap-2.5 text-xs hover:text-yellow-400 transition-colors">
                                    <MapPin size={13} className="text-cyan-300 shrink-0" />
                                    {t("footer.location")}
                                </div>
                                <div className="flex items-center gap-2.5 text-xs hover:text-yellow-400 transition-colors">
                                    <Clock size={13} className="text-cyan-300" />
                                    {t("footer.timing")}
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="flex items-center gap-2">
                                {socials.map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        aria-label={s.label}
                                        className="w-9 h-9 rounded-xl bg-cyan-900 hover:bg-yellow-500/20 border border-cyan-800 hover:border-yellow-500/40 flex items-center justify-center text-cyan-300 hover:text-yellow-400 transition-all"
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Shop */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                                {t("footer.shop")}
                            </h4>
                            <ul className="space-y-2.5">
                                {Array.isArray(shopLinks) && shopLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <a href="/" className="text-xs hover:text-yellow-400 transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                                {t("footer.company")}
                            </h4>
                            <ul className="space-y-2.5">
                                {Array.isArray(companyLinks) && companyLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <a href="/" className="text-xs hover:text-yellow-400 transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                                {t("footer.support")}
                            </h4>
                            <ul className="space-y-2.5">
                                {Array.isArray(supportLinks) && supportLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <a href="/" className="text-xs hover:text-yellow-400 transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Download & Payment */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                                {t("footer.download")}
                            </h4>
                            <div className="space-y-2 mb-6">
                                <button className="flex items-center gap-2 w-full px-3 py-2.5 bg-cyan-900 border border-cyan-800 rounded-xl hover:bg-cyan-800 transition-all">
                                    <Smartphone size={16} className="text-cyan-300" />
                                    <div className="text-start">
                                        <p className="text-[9px] text-cyan-200/60 leading-none">{t("footer.getItOn")}</p>
                                        <p className="text-xs font-bold text-white leading-tight">Google Play</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2.5 bg-cyan-900 border border-cyan-800 rounded-xl hover:bg-cyan-800 transition-all">
                                    <Smartphone size={16} className="text-cyan-300" />
                                    <div className="text-start">
                                        <p className="text-[9px] text-cyan-200/60 leading-none">{t("footer.downloadOn")}</p>
                                        <p className="text-xs font-bold text-white leading-tight">App Store</p>
                                    </div>
                                </button>
                            </div>

                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">
                                {t("footer.weAccept")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { icon: <CreditCard size={14} />, label: t("footer.paymentMethods.cards") },
                                    { icon: <Smartphone size={14} />, label: t("footer.paymentMethods.upi") },
                                    { icon: <Banknote size={14} />, label: t("footer.paymentMethods.cod") },
                                ].map((pm) => (
                                    <div
                                        key={pm.label}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-900 border border-cyan-800 rounded-lg"
                                    >
                                        <span className="text-cyan-300">{pm.icon}</span>
                                        <span className="text-[10px] font-medium text-cyan-200/80">{pm.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-cyan-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-cyan-200/60">
                        <ShieldCheck size={14} className="text-yellow-500" />
                        <span>{t("footer.secure")}</span>
                    </div>

                    <p className="text-xs text-cyan-200/60">
                        © {year} SIMAK FRESH. {t("footer.rights")}
                    </p>

                    <div className="flex items-center gap-4">
                        {Array.isArray(legalLinks) && legalLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href="/"
                                className="text-[10px] text-cyan-200/60 hover:text-yellow-400 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
