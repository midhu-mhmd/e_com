import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    CheckCircle,
    ChevronRight,
    Copy,
    Gift,
    Mail,
    MapPin,
    Package,
    Percent,
    Phone,
    Share2,
    ShoppingBag,
    User,
    Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "../../hooks/queries";
import useLanguageToggle from "../../hooks/useLanguageToggle";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../services/api";

type QuickLink = {
    to: string;
    label: string;
    icon: React.ReactNode;
    tone: string;
};

type ProfileCouponCard = {
    id: string;
    code: string;
    title: string;
    description: string;
    badge: string;
    validTo: string | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    isReferralReward: boolean;
    isFirstOrderReward: boolean;
    status: "active" | "expired" | "inactive" | "used";
};

const useDocumentDirection = (language?: string) => {
    useEffect(() => {
        if (language) {
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        }
    }, [language]);
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
        </div>
    </div>
);

const QuickLinkCard: React.FC<QuickLink> = ({ to, label, icon, tone }) => (
    <Link
        to={to}
        className={`flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${tone}`}
    >
        <span className="inline-flex items-center gap-3">
            {icon}
            {label}
        </span>
        <ChevronRight size={16} className="text-current/60" />
    </Link>
);

const ProfilePage: React.FC = () => {
    const { t, i18n } = useTranslation("profile");
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: any) => state.auth); // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: profileData } = useUserProfile(isAuthenticated);

    useLanguageToggle();
    useDocumentDirection(i18n?.language);

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-[#F8FAFB] px-4 py-10">
                <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                        <User size={30} />
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900">{t("profile.auth.loginRequired")}</h1>
                    <p className="mt-2 text-sm text-slate-500">{t("profile.auth.goToLogin", { defaultValue: "Go to Login" })}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700"
                    >
                        {t("profile.auth.goToLogin", { defaultValue: "Go to Login" })}
                    </button>
                </div>
            </div>
        );
    }

    const displayUser = profileData || user;
    const fullName = [displayUser?.first_name, displayUser?.last_name].filter(Boolean).join(" ") || displayUser?.username || t("profile.auth.accountMember");
    const initials = fullName
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const quickLinks: QuickLink[] = [
        { to: "/orders", label: t("profile.sidebar.myOrders", { defaultValue: "My Orders" }), icon: <Package size={16} />, tone: "bg-amber-50 text-amber-700" },
        { to: "/profile/referrals", label: t("profile.sidebar.referrals", { defaultValue: "Referrals" }), icon: <Gift size={16} />, tone: "bg-cyan-50 text-cyan-700" },
        { to: "/profile/coupons", label: t("profile.coupons.title", { defaultValue: "Available Coupons" }), icon: <Percent size={16} />, tone: "bg-emerald-50 text-emerald-700" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFB] font-sans">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:py-12">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-cyan-200 hover:text-cyan-700"
                    >
                        <span className="rotate-180">›</span>
                        {t("profile.sidebar.backToProfile", { defaultValue: "Back to Home" })}
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">
                    <section className="space-y-4">
                        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="h-24 bg-linear-to-br from-cyan-500 via-cyan-600 to-teal-600" />
                            <div className="px-5 pb-5">
                                <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-50 text-xl font-black text-cyan-700 shadow-lg">
                                    {displayUser?.profile?.profile_picture ? <img src={displayUser.profile.profile_picture} alt="Avatar" className="h-full w-full object-cover" /> : initials}
                                </div>
                                <h1 className="text-xl font-extrabold text-slate-900">{fullName}</h1>
                                <p className="mt-1 text-sm text-slate-500">{displayUser?.email || t("profile.auth.accountMember")}</p>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <InfoRow icon={<Phone size={14} />} label={t("profile.personalInfo.phone", { defaultValue: "Phone" })} value={displayUser?.phone_number || "Not set"} />
                            <InfoRow icon={<Mail size={14} />} label={t("profile.personalInfo.email", { defaultValue: "Email" })} value={displayUser?.email || "Not set"} />
                            <InfoRow icon={<MapPin size={14} />} label={t("profile.addresses.title", { defaultValue: "Saved Addresses" })} value={t("profile.addresses.subtitle", { defaultValue: "Manage delivery locations" })} />
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-extrabold text-slate-900">{t("profile.personalInfo.title", { defaultValue: "Profile" })}</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("profile.personalInfo.subtitle", { defaultValue: "Quick access to your account sections and referral rewards." })}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {quickLinks.map((link) => (
                                <QuickLinkCard key={link.to} {...link} />
                            ))}
                        </div>

                        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">{t("profile.referrals.howItWorks", { defaultValue: "Referrals and coupons" })}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("profile.referrals.description", { defaultValue: "Use the dedicated pages to view your referral program details and all coupons returned by the API." })}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link to="/profile/referrals" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-cyan-700">
                                    {t("profile.sidebar.referrals", { defaultValue: "Referrals" })}
                                </Link>
                                <Link to="/profile/coupons" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                                    {t("profile.coupons.title", { defaultValue: "Available Coupons" })}
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const ProfileSectionShell: React.FC<{
    title: string;
    subtitle: string;
    children: (displayUser: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}> = ({ title, subtitle, children }) => {
    const { t, i18n } = useTranslation("profile");
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: any) => state.auth); // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: profileData } = useUserProfile(isAuthenticated);

    useLanguageToggle();
    useDocumentDirection(i18n?.language);

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-300 shadow-sm">
                        <Gift size={36} />
                    </div>
                    <p className="font-medium text-slate-500">{t("profile.auth.loginRequired")}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full rounded-xl bg-cyan-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700 sm:w-auto"
                    >
                        {t("profile.auth.goToLogin", { defaultValue: "Go to Login" })}
                    </button>
                </div>
            </div>
        );
    }

    const displayUser = profileData || user;

    return (
        <div className="min-h-screen bg-[#F8FAFB] font-sans">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:py-12">
                <div className="mb-6 flex items-center">
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-cyan-200 hover:text-cyan-700"
                    >
                        <ChevronRight size={14} className="rotate-180" />
                        {t("profile.sidebar.backToProfile", { defaultValue: "Back to Profile" })}
                    </Link>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 md:p-8">
                    <div className="mb-8 text-center lg:text-start">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-100 to-teal-100 lg:mx-0">
                            <Gift size={28} className="text-cyan-600" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl leading-tight">{title}</h1>
                        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm lg:mx-0">{subtitle}</p>
                    </div>
                    {children(displayUser)}
                </div>
            </div>
        </div>
    );
};

const ReferralSection: React.FC<{ user: any }> = ({ user }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { t } = useTranslation("profile");
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    let referralCode = user?.referral_code;
    if (!referralCode) {
        referralCode = user?.phone_number ? `SIMAK${user.phone_number.replace(/[^0-9]/g, "").slice(-6)}` : "SIMAKFRESH";
    }

    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const handleCopy = async (text: string, message = t("profile.referrals.copySuccess", { defaultValue: "Copied to clipboard!" })) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.show(message, "success");
            window.setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.show(t("profile.referrals.copyError", { defaultValue: "Failed to copy" }), "error");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Simak Fresh — Refer & Earn!",
                    text: `Use my referral code ${referralCode} and get 20% OFF on your first order at Simak Fresh!`,
                    url: referralLink,
                });
            } catch {
                // user cancelled
            }
            return;
        }

        void handleCopy(referralLink, t("profile.referrals.linkCopied", { defaultValue: "Referral link copied!" }));
    };

    const steps = [
        {
            num: "01",
            title: t("profile.referrals.steps.one.title", { defaultValue: "Invite a Friend" }),
            desc: t("profile.referrals.steps.one.desc", { defaultValue: "Share your unique referral code with friends and family. Ask them to register on Simak Fresh." }),
        },
        {
            num: "02",
            title: t("profile.referrals.steps.two.title", { defaultValue: "Friend Makes First Purchase" }),
            desc: t("profile.referrals.steps.two.desc", { defaultValue: "Your friend enters your referral code at checkout on their first order." }),
        },
        {
            num: "03",
            title: t("profile.referrals.steps.three.title", { defaultValue: "Both Get 20% OFF" }),
            desc: t("profile.referrals.steps.three.desc", { defaultValue: "Your friend gets 20% OFF instantly! Once the order is delivered, you also receive a 20% discount coupon." }),
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="space-y-8">
                <div className="text-center lg:text-start">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-100 to-teal-100 lg:mx-0">
                        <Gift size={28} className="text-cyan-600" />
                    </div>
                    <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-2xl">
                        {t("profile.referrals.title", { defaultValue: "Friends Who Refer" })}<br />
                        <span className="bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                            {t("profile.referrals.subtitle", { defaultValue: "Stay Friends Forever" })}
                        </span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-slate-500 md:text-sm lg:mx-0">
                        {t("profile.referrals.description", { defaultValue: "When you refer your friend to Simak Fresh, you get 20% OFF on your next order and so does your friend. Then you both eat healthy ever after!" })}
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-500 via-cyan-600 to-teal-600 p-5 md:p-6">
                    <div className="absolute -inset-e-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -inset-s-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
                    <div className="relative z-10">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-100 md:text-[11px]">
                            {t("profile.referrals.codeLabel", { defaultValue: "Your Referral Code" })}
                        </p>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex-1 select-all rounded-xl border border-white/20 bg-white/15 px-4 py-3 font-mono text-lg font-black tracking-widest text-white backdrop-blur-sm md:text-xl">
                                {referralCode}
                            </div>
                            <button
                                onClick={() => void handleCopy(referralCode, t("profile.referrals.copyCode", { defaultValue: "Referral code copied!" }))}
                                className={`shrink-0 rounded-xl p-3 text-sm font-bold transition-all ${copied ? "bg-emerald-400 text-white" : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"}`}
                                title="Copy code"
                            >
                                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <button
                                onClick={handleShare}
                                className="flex-1 rounded-xl bg-white py-3 text-sm font-bold text-cyan-700 shadow-lg shadow-black/10 transition-all active:scale-[0.97] hover:bg-cyan-50 inline-flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} />
                                {t("profile.referrals.startReferring", { defaultValue: "Start Referring, Start Earning!" })}
                            </button>
                            <button
                                onClick={() => void handleCopy(referralLink, t("profile.referrals.linkCopied", { defaultValue: "Referral link copied!" }))}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/25"
                            >
                                <Copy size={14} />
                                {t("profile.referrals.copyLink", { defaultValue: "Copy Link" })}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-6 text-center text-sm font-extrabold uppercase tracking-wider text-slate-900 lg:text-start md:mb-8">
                        {t("profile.referrals.howItWorks", { defaultValue: "Here is How it " })}
                        <span className="bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">{t("profile.referrals.works", { defaultValue: "Works" })}</span>
                    </h3>

                    <div className="space-y-5 md:space-y-6">
                        {steps.map((step, idx) => (
                            <motion.div key={step.num} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.12, duration: 0.35 }} className="group flex items-start gap-4 md:gap-5">
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${idx === 0 ? "from-cyan-400 to-teal-400" : idx === 1 ? "from-violet-400 to-indigo-400" : "from-amber-400 to-orange-400"} text-sm font-black text-white shadow-lg md:h-12 md:w-12 md:text-base`}>
                                        {step.num}
                                    </div>
                                    {idx < steps.length - 1 && <div className="mt-2 h-8 w-0.5 bg-linear-to-b from-slate-200 to-transparent md:h-10" />}
                                </div>

                                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all group-hover:-translate-y-0.5 group-hover:border-slate-200 group-hover:bg-white group-hover:shadow-sm md:p-5">
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm border border-slate-100 md:h-20 md:w-20">
                                            <Gift size={22} className="text-cyan-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="mb-1 text-sm font-bold text-slate-900 md:text-base">{step.title}</h4>
                                            <p className="text-[11px] leading-relaxed text-slate-500 md:text-xs">{step.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="text-center lg:text-start">
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97] hover:shadow-lg hover:shadow-cyan-200/50"
                    >
                        <Gift size={18} />
                        {t("profile.referrals.startReferring", { defaultValue: "Start Referring, Start Earning!" })}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <Users size={18} />, label: t("profile.referrals.stats.invited", { defaultValue: "Friends Invited" }), value: "—", bg: "bg-cyan-50", color: "text-cyan-600" },
                        { icon: <ShoppingBag size={18} />, label: t("profile.referrals.stats.successful", { defaultValue: "Successful" }), value: "—", bg: "bg-emerald-50", color: "text-emerald-600" },
                        { icon: <Percent size={18} />, label: t("profile.referrals.stats.earned", { defaultValue: "Coupons Earned" }), value: "—", bg: "bg-amber-50", color: "text-amber-600" },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center md:p-4">
                            <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="text-lg font-black text-slate-900 md:text-xl">{stat.value}</div>
                            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 md:text-[10px]">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <AlertCircle size={14} className="text-slate-400" />
                        {t("profile.referrals.terms.title", { defaultValue: "Terms and Conditions" })}
                    </h4>
                    <ol className="list-inside list-decimal space-y-1.5 text-[10px] leading-relaxed text-slate-500 md:text-[11px]">
                        <li>{t("profile.referrals.terms.1", { defaultValue: "Your 20% Discount Coupon is valid for 3 months from the date of issue and can be used only once." })}</li>
                        <li>{t("profile.referrals.terms.2", { defaultValue: "Maximum discount that can be availed is AED 20." })}</li>
                        <li>{t("profile.referrals.terms.3", { defaultValue: "This offer is ONLY valid in UAE." })}</li>
                        <li>{t("profile.referrals.terms.4", { defaultValue: "This offer is not transferable." })}</li>
                        <li>{t("profile.referrals.terms.5", { defaultValue: "Simak Fresh reserves the right to modify or terminate this program at any time." })}</li>
                        <li>{t("profile.referrals.terms.6", { defaultValue: "The referral code must be applied at checkout during the friend's first purchase." })}</li>
                    </ol>
                </div>
            </div>
        </motion.div>
    );
};

const CouponsSection: React.FC<{ user: any }> = ({ user }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { t } = useTranslation("profile");
    const [coupons, setCoupons] = useState<ProfileCouponCard[]>([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [couponsError, setCouponsError] = useState<string | null>(null);
    const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        let mounted = true;

        const loadCoupons = async () => {
            setLoadingCoupons(true);
            setCouponsError(null);

            try {
                const response = await api.get("/marketing/coupons/");
                const rawCoupons = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.results) ? response.data.results : [];

                const normalizedCoupons = rawCoupons
                    .map((coupon: any, index: number): ProfileCouponCard | null => { // eslint-disable-line @typescript-eslint/no-explicit-any
                        const code = String(coupon?.coupon_code ?? coupon?.code ?? coupon?.promo_code ?? "").trim().toUpperCase();
                        if (!code) return null;

                        const discountType = String(coupon?.discount_type ?? "").toLowerCase();
                        const discountValue = Number.parseFloat(String(coupon?.discount_value ?? coupon?.discount_amount ?? coupon?.discount_percentage ?? coupon?.amount ?? 0));
                        const badge = discountType === "percentage"
                            ? `${Number.isFinite(discountValue) ? discountValue : 0}% OFF`
                            : Number.isFinite(discountValue) && discountValue > 0
                                ? `AED ${discountValue.toFixed(0)} OFF`
                                : t("profile.coupons.reward", { defaultValue: "Reward coupon" });

                        const validTo = coupon?.valid_to ?? null;
                        const usageLimit = coupon?.usage_limit ?? null;
                        const usedCount = Number(coupon?.used_count ?? 0);
                        const parsedExpiry = validTo ? Date.parse(validTo) : Number.NaN;
                        const isExpired = !Number.isNaN(parsedExpiry) && parsedExpiry < Date.now();
                        const isUsed = usageLimit !== null && usedCount >= Number(usageLimit);
                        const isActive = coupon?.is_active !== false;

                        let status: ProfileCouponCard["status"] = "active";
                        if (!isActive) status = "inactive";
                        else if (isExpired) status = "expired";
                        else if (isUsed) status = "used";

                        return {
                            id: String(coupon?.id ?? `${code}-${index}`),
                            code,
                            title: String(coupon?.title ?? coupon?.name ?? code),
                            description: String(coupon?.description ?? coupon?.message ?? coupon?.short_description ?? t("profile.coupons.available", { defaultValue: "Available coupon" })),
                            badge,
                            validTo,
                            usageLimit,
                            usedCount,
                            isActive,
                            isReferralReward: Boolean(coupon?.is_referral_reward),
                            isFirstOrderReward: Boolean(coupon?.is_first_order_reward),
                            status,
                        };
                    })
                    .filter((coupon: ProfileCouponCard | null): coupon is ProfileCouponCard => Boolean(coupon));

                if (mounted) {
                    setCoupons(normalizedCoupons);
                }
            } catch {
                if (mounted) {
                    setCouponsError(t("profile.coupons.error", { defaultValue: "Unable to load your coupons right now." }));
                }
            } finally {
                if (mounted) {
                    setLoadingCoupons(false);
                }
            }
        };

        void loadCoupons();

        return () => {
            mounted = false;
        };
    }, [t, user?.id]);

    const handleCopyCoupon = async (coupon: ProfileCouponCard) => {
        try {
            await navigator.clipboard.writeText(coupon.code);
            setCopiedCouponId(coupon.id);
            toast.show(t("profile.coupons.copied", { defaultValue: "Coupon code copied!" }), "success");
            window.setTimeout(() => setCopiedCouponId((current) => (current === coupon.id ? null : current)), 2500);
        } catch {
            toast.show(t("profile.referrals.copyError", { defaultValue: "Failed to copy" }), "error");
        }
    };

    const availableCoupons = coupons;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900">{t("profile.coupons.title", { defaultValue: "Available Coupons" })}</h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">{t("profile.coupons.subtitle", { defaultValue: "Your active discounts and rewards at a glance." })}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
                    <Percent size={14} />
                    {availableCoupons.length} {t("profile.coupons.stats.available", { defaultValue: "Available" })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                    { label: t("profile.coupons.stats.available", { defaultValue: "Available" }), value: availableCoupons.length.toString(), icon: <Percent size={16} />, tone: "bg-cyan-50 text-cyan-600" },
                    { label: t("profile.coupons.stats.referral", { defaultValue: "Referral" }), value: availableCoupons.filter((coupon) => coupon.isReferralReward).length.toString(), icon: <Gift size={16} />, tone: "bg-amber-50 text-amber-600" },
                    { label: t("profile.coupons.stats.firstOrder", { defaultValue: "First Order" }), value: availableCoupons.filter((coupon) => coupon.isFirstOrderReward).length.toString(), icon: <ShoppingBag size={16} />, tone: "bg-emerald-50 text-emerald-600" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                        <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>{stat.icon}</div>
                        <div className="text-base font-black text-slate-900">{stat.value}</div>
                        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {loadingCoupons && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[0, 1].map((index) => (
                        <div key={index} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <div className="h-3 w-24 rounded bg-slate-200" />
                            <div className="mt-3 h-6 w-32 rounded bg-slate-200" />
                            <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="h-11 rounded-xl bg-slate-200" />
                                <div className="h-11 rounded-xl bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loadingCoupons && couponsError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{couponsError}</div>
            )}

            {!loadingCoupons && !couponsError && availableCoupons.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm">
                        <Percent size={20} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">{t("profile.coupons.empty", { defaultValue: "No coupons are available right now." })}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{t("profile.coupons.emptyHint", { defaultValue: "Earn one through referrals or check back after a new campaign goes live." })}</p>
                </div>
            )}

            {!loadingCoupons && availableCoupons.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {availableCoupons.map((coupon) => {
                        const parsedExpiry = coupon.validTo ? Date.parse(coupon.validTo) : Number.NaN;
                        const expiryLabel = Number.isNaN(parsedExpiry)
                            ? t("profile.coupons.noExpiry", { defaultValue: "No expiry" })
                            : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(parsedExpiry));
                        const usageLabel = coupon.usageLimit !== null
                            ? `${coupon.usedCount}/${coupon.usageLimit}`
                            : t("profile.coupons.unlimited", { defaultValue: "Unlimited" });
                        const rewardLabel = coupon.isReferralReward
                            ? t("profile.coupons.referralReward", { defaultValue: "Referral reward" })
                            : coupon.isFirstOrderReward
                                ? t("profile.coupons.firstOrderReward", { defaultValue: "First order reward" })
                                : t("profile.coupons.reward", { defaultValue: "Reward coupon" });

                        return (
                            <div key={coupon.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{rewardLabel}</p>
                                        <h4 className="mt-1 break-all select-all font-mono text-lg font-black tracking-[0.2em] text-slate-900">{coupon.code}</h4>
                                        <p className="mt-2 text-xs leading-relaxed text-slate-500">{coupon.description}</p>
                                    </div>
                                    <button
                                        onClick={() => void handleCopyCoupon(coupon)}
                                        className={`shrink-0 rounded-xl border p-2.5 transition-all ${copiedCouponId === coupon.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-cyan-600"}`}
                                        title={t("profile.coupons.copyCode", { defaultValue: "Copy code" })}
                                    >
                                        {copiedCouponId === coupon.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{t("profile.coupons.discount", { defaultValue: "Discount" })}</p>
                                        <p className="mt-0.5 font-black text-slate-900">{coupon.badge}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{t("profile.coupons.validUntil", { defaultValue: "Valid until" })}</p>
                                        <p className="mt-0.5 font-black text-slate-900">{expiryLabel}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{t("profile.coupons.usage", { defaultValue: "Usage" })}</p>
                                        <p className="mt-0.5 font-black text-slate-900">{usageLabel}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{t("profile.coupons.status", { defaultValue: "Status" })}</p>
                                        <p className={`mt-0.5 font-black ${coupon.status === "active" ? "text-emerald-600" : coupon.status === "expired" ? "text-amber-600" : coupon.status === "inactive" ? "text-slate-500" : "text-cyan-600"}`}>
                                            {coupon.status === "active"
                                                ? t("profile.coupons.active", { defaultValue: "Active" })
                                                : coupon.status === "expired"
                                                    ? t("profile.coupons.expired", { defaultValue: "Expired" })
                                                    : coupon.status === "inactive"
                                                        ? t("profile.coupons.inactive", { defaultValue: "Inactive" })
                                                        : t("profile.coupons.used", { defaultValue: "Used" })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const ReferralPage: React.FC = () => (
    <ProfileSectionShell title="Referrals" subtitle="Invite friends, share your code, and review the referral program details in a dedicated page.">
        {(displayUser) => <ReferralSection user={displayUser} />}
    </ProfileSectionShell>
);

export const CouponsPage: React.FC = () => (
    <ProfileSectionShell title="Available Coupons" subtitle="All coupons currently available to your account are listed here, regardless of reward type.">
        {(displayUser) => <CouponsSection user={displayUser} />}
    </ProfileSectionShell>
);

export default ProfilePage;
