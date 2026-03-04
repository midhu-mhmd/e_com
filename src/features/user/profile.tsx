import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
    User, Mail, Phone, LogOut, Camera, Save, Loader2, Calendar,
    MapPin, Package, Plus, Edit3, X, Home, Briefcase, Globe,
    ChevronRight, CheckCircle, Hash, Clock, Truck, XCircle, AlertCircle,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout, setUser } from "../auth/authSlice";
import { profileApi, type ProfileUpdatePayload } from "./profileApi";
import { customersApi, type AddressDto, type UserDto } from "../admin/customers/customersApi";
import { ordersApi, type OrderDto } from "../admin/orders/ordersApi";
import { useUserProfile } from "../../hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import { tokenManager } from "../../services/api";
import useLanguageToggle from "../../hooks/useLanguageToggle";
import { useTranslation } from "react-i18next";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
type TabKey = "profile" | "orders" | "addresses";

const EMIRATES = [
    { value: "abu_dhabi", label: "Abu Dhabi" },
    { value: "dubai", label: "Dubai" },
    { value: "sharjah", label: "Sharjah" },
    { value: "ajman", label: "Ajman" },
    { value: "umm_al_quwain", label: "Umm Al Quwain" },
    { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
    { value: "fujairah", label: "Fujairah" },
];

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
const ProfilePage: React.FC = () => {
    // Bring in i18n to ensure we can listen to language state on initial load
    const { t, i18n } = useTranslation("profile");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: any) => state.auth); // eslint-disable-line @typescript-eslint/no-explicit-any
    const queryClient = useQueryClient();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState<TabKey>("profile");
    const [uploadingImage, setUploadingImage] = useState(false);

    const { data: profileData, isLoading: loading, refetch } = useUserProfile(isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Force document direction to update dynamically based on language selection
    useEffect(() => {
        if (i18n?.language) {
            document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        }
    }, [i18n?.language]);

    const handleLogout = () => {
        dispatch(logout() as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        queryClient.clear(); // Clear all queries on logout to prevent state leak
        navigate("/login");
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center space-y-4 w-full max-w-sm">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 shadow-sm border border-slate-100">
                        <User size={36} />
                    </div>
                    <p className="text-slate-500 font-medium">{t("profile.auth.loginRequired")}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Prioritize profileData but allow Redux user to provide the most recent verification flags if query is stale
    const displayUser = profileData || user;
    const fullName = [displayUser?.first_name, displayUser?.last_name].filter(Boolean).join(" ") || displayUser?.username || t("profile.auth.accountMember");
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            // Optimistically show the image instantly
            const previewUrl = URL.createObjectURL(file);
            const optimisticUser = {
                ...displayUser,
                profile: {
                    ...(displayUser?.profile || {}),
                    profile_picture: previewUrl
                }
            };
            queryClient.setQueryData(["userProfile"], optimisticUser);
            dispatch(setUser(optimisticUser));

            const formData = new FormData();
            formData.append("profile.profile_picture", file);
            await profileApi.updateProfile(displayUser.id, formData);

            // Refetch to ensure all fields and absolute URLs match exactly what the backend gives on fresh load
            const freshProfile = await profileApi.getMe();

            queryClient.setQueryData(["userProfile"], freshProfile);
            dispatch(setUser(freshProfile));
            toast.show(t("profile.messages.profilePicUpdated"), "success");
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const msg = err?.response?.data?.detail
                || err?.response?.data?.profile?.profile_picture?.[0]
                || t("profile.messages.failedToUpdateProfilePic");
            toast.show(msg, "error");
            // If failed, refetch to revert the optimistic update
            const freshProfile = await profileApi.getMe().catch(() => displayUser);
            queryClient.setQueryData(["userProfile"], freshProfile);
            dispatch(setUser(freshProfile));
        } finally {
            setUploadingImage(false);
        }
    };

    const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
        { key: "profile", label: "Personal Info", icon: <User size={18} /> },
        { key: "orders", label: "My Orders", icon: <Package size={18} /> },
        { key: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFB] font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-12">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">

                    {/* ═══════ LEFT SIDEBAR ═══════ */}
                    <div className="space-y-4 md:space-y-5">
                        {/* Avatar Card */}
                        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">

                            {/* ✅ Logout Button placed inside the profile card */}
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="absolute top-4 end-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-sm"
                            >
                                <LogOut size={16} />
                            </button>

                            <div className="h-20 md:h-24 bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-600 relative">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute -top-8 -end-8 w-32 h-32 bg-white rounded-full blur-2xl" />
                                    <div className="absolute -bottom-12 -start-8 w-40 h-40 bg-cyan-300 rounded-full blur-3xl" />
                                </div>
                            </div>

                            <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-10 md:-mt-12 flex flex-col sm:flex-row md:flex-col items-start sm:items-end md:items-start gap-4 md:gap-0">
                                <div className="relative group w-fit">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-1 shadow-lg">
                                        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-cyan-50 to-slate-50 flex items-center justify-center overflow-hidden">
                                            {displayUser?.profile?.profile_picture ? (
                                                <img src={displayUser.profile.profile_picture} alt="Avatar" className="w-full h-full object-cover rounded-[14px]" />
                                            ) : (
                                                <span className="text-lg md:text-xl font-black text-cyan-600">{initials}</span>
                                            )}
                                        </div>
                                    </div>
                                    <label className="absolute -bottom-1 -end-1 p-1.5 bg-white rounded-lg shadow-md border border-slate-100 text-slate-400 hover:text-cyan-600 transition-all cursor-pointer hover:shadow-lg">
                                        <input type="file" className="hidden" accept="image/*" disabled={uploadingImage} onChange={handleImageUpload} />
                                        {uploadingImage ? <Loader2 size={14} className="animate-spin text-cyan-500" /> : <Camera size={14} />}
                                    </label>
                                </div>

                                <div className="mt-0 sm:mt-2 md:mt-4 space-y-1 sm:pb-1 md:pb-0">
                                    <h2 className="text-base md:text-lg font-bold text-slate-900">{fullName}</h2>
                                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-400">
                                        <Phone size={12} />
                                        <span>{displayUser?.phone_number || "Not set"}</span>
                                    </div>
                                    {displayUser?.email && (
                                        <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-400">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[220px]">{displayUser.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm p-2 flex overflow-x-auto md:flex-col gap-2 md:gap-1 profile-hide-scrollbar">
                            {tabs.map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex-shrink-0 whitespace-nowrap md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === key
                                        ? "bg-cyan-50 text-cyan-700"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                        }`}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══════ MAIN CONTENT ═══════ */}
                    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 md:p-8 min-h-[400px] md:min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === "profile" && (
                                <PersonalInfoTab
                                    key="profile"
                                    profileData={displayUser}
                                    loading={loading}
                                    onSaved={(freshUser) => {
                                        queryClient.setQueryData(["userProfile"], freshUser);
                                        dispatch(setUser(freshUser));
                                        toast.show(t("profile.messages.profileUpdated"), "success");
                                    }}
                                    onError={(msg) => toast.show(msg, "error")}
                                />
                            )}
                            {activeTab === "orders" && <OrdersTab key="orders" />}
                            {activeTab === "addresses" && (
                                <AddressesTab
                                    key="addresses"
                                    onSuccess={(msg) => toast.show(msg, "success")}
                                    onError={(msg) => toast.show(msg, "error")}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   Personal Info Tab — view/edit toggle
   ═══════════════════════════════════════════════ */
interface PersonalInfoTabProps {
    profileData: UserDto | null;
    loading: boolean;
    onSaved: (user: UserDto) => void;
    onError: (msg: string) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ profileData, loading, onSaved, onError }) => {
    // Bring in i18n to force global document language switch on save
    const { t, i18n } = useTranslation("profile");
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<"M" | "F" | "O" | "">("");
    const [dob, setDob] = useState("");
    const [email, setEmail] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("");
    const [saving, setSaving] = useState(false);

    const toast = useToast();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const isVerified = profileData?.is_email_verified;
    const isPhoneVerified = profileData?.is_phone_verified;

    // OTP Modal State
    const [otpModalState, setOtpModalState] = useState<{
        isOpen: boolean;
        type: "email" | "phone";
        step: "input" | "otp";
        newValue: string;
        otpCode: string;
        sending: boolean;
        verifying: boolean;
        error: string | null;
    }>({
        isOpen: false,
        type: "email",
        step: "input",
        newValue: "",
        otpCode: "",
        sending: false,
        verifying: false,
        error: null
    });

    useLanguageToggle();

    useEffect(() => {
        if (profileData) {
            setFirstName(profileData.first_name || "");
            setLastName(profileData.last_name || "");
            setGender((profileData.profile?.gender as "M" | "F" | "O" | "") || "");
            setDob(profileData.profile?.date_of_birth || "");
            setEmail(profileData.email || "");
            setPreferredLanguage(profileData.profile?.preferred_language || "en");
        }
    }, [profileData]);

    const handleSave = async () => {
        if (!firstName.trim()) { onError(t("profile.messages.firstNameRequired")); return; }
        setSaving(true);
        try {
            const payload: ProfileUpdatePayload = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                profile: {
                    gender: gender as "M" | "F" | "O",
                    ...(dob ? { date_of_birth: dob } : {}), // Only include if not empty
                    preferred_language: preferredLanguage, // Use the state value
                },
            };

            await profileApi.updateProfile(profileData!.id, payload);

            // 1. Update the i18n language instance
            if (preferredLanguage && i18n.language !== preferredLanguage) {
                await i18n.changeLanguage(preferredLanguage);
                // 2. Persist to localStorage so it survives refresh
                localStorage.setItem("i18nextLng", preferredLanguage);
                // 3. Update document direction
                document.documentElement.dir = preferredLanguage === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = preferredLanguage;
            }

            const freshProfile = await profileApi.getMe();
            onSaved(freshProfile);
            setEditing(false);
        } catch (err: any) {
            onError(t("profile.messages.failedToUpdateProfile"));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profileData) {
            setFirstName(profileData.first_name || "");
            setLastName(profileData.last_name || "");
            setGender((profileData.profile?.gender as "M" | "F" | "O" | "") || "");
            setDob(profileData.profile?.date_of_birth || "");
            setPreferredLanguage(profileData.profile?.preferred_language || "en");
        }
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-300">
                <Loader2 size={28} className="animate-spin" />
            </div>
        );
    }

    const genderLabel = gender === "M" ? t("profile.personalInfo.male") : gender === "F" ? t("profile.personalInfo.female") : gender === "O" ? t("profile.personalInfo.other") : "—";

    // --- OTP Handlers ---
    const handleOpenOtpModal = (type: "email" | "phone") => {
        setOtpModalState({
            isOpen: true,
            type,
            step: "input",
            newValue: type === "email" ? profileData?.email || "" : profileData?.phone_number || "",
            otpCode: "",
            sending: false,
            verifying: false,
            error: null
        });
    };

    const handleSendOtp = async () => {
        const { type, newValue } = otpModalState;
        if (!newValue.trim()) {
            setOtpModalState(prev => ({ ...prev, error: t("profile.messages.otpInputError", { type: type === "email" ? t("profile.personalInfo.email") : t("profile.personalInfo.phone") }) }));
            return;
        }
        setOtpModalState(prev => ({ ...prev, sending: true, error: null }));
        try {
            const isValueChanged = (type === "email" && newValue !== profileData?.email) ||
                (type === "phone" && newValue !== profileData?.phone_number);

            if (isValueChanged) {
                await profileApi.updateProfile(profileData!.id, {
                    ...(type === "email" ? { email: newValue } : { phone_number: newValue })
                });
            }

            await profileApi.sendProfileOtp({
                otp_type: type,
                ...(type === "email" ? { email: newValue } : { phone_number: newValue })
            });

            if (isValueChanged) {
                const freshProfile = await profileApi.getMe();
                onSaved(freshProfile);
            }

            setOtpModalState(prev => ({ ...prev, step: "otp", sending: false, error: null }));
            toast.show(t("profile.messages.otpSent", { type: type === "email" ? t("profile.personalInfo.email") : t("profile.personalInfo.phone") }), "success");
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const msg = err?.response?.data?.detail || t("profile.messages.otpError");
            setOtpModalState(prev => ({ ...prev, sending: false, error: msg }));
        }
    };

    const handleVerifyOtp = async () => {
        const { type, otpCode, newValue } = otpModalState;
        if (!otpCode.trim() || otpCode.length < 6) {
            setOtpModalState(prev => ({ ...prev, error: t("profile.messages.otpInvalid") }));
            return;
        }
        setOtpModalState(prev => ({ ...prev, verifying: true, error: null }));
        try {
            const res = await profileApi.verifyProfileOtp({
                otp_type: type,
                otp_code: otpCode,
                ...(type === "email" ? { email: newValue } : { phone_number: newValue })
            });

            const accessToken = res?.access || res?.accessToken || res?.token;
            if (accessToken) {
                tokenManager.set(accessToken);
            }

            const freshProfile = (res?.user || res?.id) ? (res?.user || res) : await profileApi.getMe();

            queryClient.setQueryData(["userProfile"], freshProfile);
            await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            dispatch(setUser(freshProfile));
            onSaved(freshProfile);

            setOtpModalState(prev => ({ ...prev, isOpen: false, verifying: false }));
            toast.show(t("profile.otp.success", { type: type === "email" ? t("profile.personalInfo.email") : t("profile.personalInfo.phone") }), "success");
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const msg = err?.response?.data?.detail || t("profile.messages.otpVerifyError");
            setOtpModalState(prev => ({ ...prev, verifying: false, error: msg }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            {/* --- OTP MODAL --- */}
            <AnimatePresence>
                {otpModalState.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 w-full max-w-sm shadow-xl relative"
                        >
                            <button
                                onClick={() => setOtpModalState(prev => ({ ...prev, isOpen: false }))}
                                className="absolute top-3 end-3 md:top-4 md:end-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                                {t("profile.otp.verify", { type: otpModalState.type === "email" ? t("profile.personalInfo.email") : t("profile.personalInfo.phone") })}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6">
                                {otpModalState.step === "input"
                                    ? `Enter the new ${otpModalState.type} you want to verify.`
                                    : `Enter the 6-digit OTP sent to your ${otpModalState.type}.`}
                            </p>

                            {otpModalState.error && (
                                <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                                    <AlertCircle size={14} className="shrink-0" />
                                    {otpModalState.error}
                                </div>
                            )}

                            {otpModalState.step === "input" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">
                                            {otpModalState.type === "email" ? t("profile.personalInfo.email") : t("profile.personalInfo.phone")}
                                        </label>
                                        <input
                                            type={otpModalState.type === "email" ? "email" : "tel"}
                                            value={otpModalState.newValue}
                                            onChange={(e) => setOtpModalState(prev => ({ ...prev, newValue: e.target.value }))}
                                            className="profile-field-input mt-1"
                                            placeholder={otpModalState.type === "email" ? "Enter email..." : "Enter phone..."}
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={otpModalState.sending}
                                        className="w-full py-3 md:py-3.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {otpModalState.sending ? <Loader2 size={16} className="animate-spin" /> : t("profile.otp.send")}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">
                                            {t("profile.otp.label")}
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otpModalState.otpCode}
                                            onChange={(e) => setOtpModalState(prev => ({ ...prev, otpCode: e.target.value.replace(/\D/g, '') }))}
                                            className="profile-field-input mt-1 tracking-widest text-center text-lg md:text-xl font-bold"
                                            placeholder={t("profile.otp.placeholder")}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2 md:gap-3">
                                        <button
                                            onClick={() => setOtpModalState(prev => ({ ...prev, step: "input", error: null }))}
                                            className="flex-1 py-3 md:py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={otpModalState.verifying || otpModalState.otpCode.length < 6}
                                            className="flex-[2] py-3 md:py-3.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {otpModalState.verifying ? <Loader2 size={16} className="animate-spin" /> : t("profile.otp.verify", { type: "" }).trim()}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header with edit toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 flex-shrink-0">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Personal Information</h2>
                        <p className="text-[11px] md:text-xs text-slate-400">Your personal details and preferences</p>
                    </div>
                </div>

                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-cyan-50 hover:text-cyan-600 transition-colors border border-slate-100"
                    >
                        <Edit3 size={14} /> {t("profile.personalInfo.edit")}
                    </button>
                ) : (
                    <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-100"
                    >
                        <X size={14} /> {t("profile.personalInfo.cancel")}
                    </button>
                )}
            </div>

            <div className="space-y-4 md:space-y-5">
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField
                        label={t("profile.personalInfo.firstName")}
                        value={firstName}
                        editing={editing}
                        onChange={setFirstName}
                        placeholder="Jane"
                        required
                    />
                    <InfoField
                        label={t("profile.personalInfo.lastName")}
                        value={lastName}
                        editing={editing}
                        onChange={setLastName}
                        placeholder="Doe"
                    />
                </div>

                {/* Email (Standard Profile Update) */}
                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 w-full">
                            <InfoField
                                label={t("profile.personalInfo.email")}
                                value={email}
                                editing={editing}
                                onChange={setEmail}
                                placeholder="jane@example.com"
                            />
                        </div>
                        {!editing && (
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto sm:mt-6 shrink-0">
                                <button
                                    onClick={() => handleOpenOtpModal("email")}
                                    className={`w-auto px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold text-xs transition-colors shadow-sm ${!profileData?.email || !isVerified
                                        ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {profileData?.email ? (isVerified ? t("profile.personalInfo.changeEmail") : t("profile.personalInfo.verifyEmail")) : t("profile.personalInfo.addEmail")}
                                </button>
                                {profileData?.email && (
                                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-center ${isVerified
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-amber-50 text-amber-600"
                                        }`}>
                                        {isVerified ? t("profile.personalInfo.verified") : t("profile.personalInfo.unverified")}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phone — editable via OTP */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">{t("profile.personalInfo.phone")}</label>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{profileData?.phone_number || "Not provided"}</span>
                            {profileData?.phone_number && (
                                <span className={`ms-auto shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isPhoneVerified
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                    }`}>
                                    {isPhoneVerified ? t("profile.personalInfo.verified") : t("profile.personalInfo.unverified")}
                                </span>
                            )}
                        </div>
                        {!editing && !isPhoneVerified && (
                            <div className="flex w-full sm:w-auto shrink-0">
                                <button
                                    onClick={() => handleOpenOtpModal("phone")}
                                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors shadow-sm"
                                >
                                    Edit Phone
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">{t("profile.personalInfo.gender")}</label>
                    {editing ? (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {(["M", "F", "O"] as const).map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGender(g)}
                                    className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border-2 ${gender === g
                                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                        : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200 hover:text-slate-600"
                                        }`}
                                >
                                    {g === "M" ? t("profile.personalInfo.male") : g === "F" ? t("profile.personalInfo.female") : t("profile.personalInfo.other")}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700">
                            {genderLabel}
                        </div>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">{t("profile.personalInfo.dob")}</label>
                    {editing ? (
                        <div className="relative">
                            <Calendar size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="profile-field-input ps-11" />
                        </div>
                    ) : (
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            {dob ? new Date(dob + "T00:00:00").toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </div>
                    )}
                </div>

                {/* Preferred Language */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1">{t("profile.personalInfo.language")}</label>
                    {editing ? (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                { id: "en", label: "English" },
                                { id: "ar", label: "Arabic" },
                                { id: "cn", label: "Chinese" }
                            ].map((lang) => (
                                <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => setPreferredLanguage(lang.id)}
                                    className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all border-2 ${preferredLanguage === lang.id
                                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                        : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200 hover:text-slate-600"
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Globe size={14} className="text-slate-400 shrink-0" />
                            {preferredLanguage === "en" ? t("profile.personalInfo.english") : preferredLanguage === "ar" ? t("profile.personalInfo.arabic") : preferredLanguage === "cn" ? t("profile.personalInfo.chinese") : t("profile.personalInfo.english")}
                        </div>
                    )}
                </div>

                {/* Save Button — only visible in edit mode */}
                {editing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end pt-6 border-t border-slate-100"
                    >
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? t("profile.personalInfo.saving") : t("profile.personalInfo.save")}
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════
   Orders Tab — summary list
   ═══════════════════════════════════════════════ */
const getStatusMap = (t: any) => ({
    pending: { color: "text-amber-600", bg: "bg-amber-50", icon: <Clock size={12} />, label: t("profile.orders.status.pending") },
    confirmed: { color: "text-blue-600", bg: "bg-blue-50", icon: <CheckCircle size={12} />, label: t("profile.orders.status.confirmed") },
    processing: { color: "text-indigo-600", bg: "bg-indigo-50", icon: <Package size={12} />, label: t("profile.orders.status.processing") },
    shipped: { color: "text-cyan-600", bg: "bg-cyan-50", icon: <Truck size={12} />, label: t("profile.orders.status.shipped") },
    delivered: { color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={12} />, label: t("profile.orders.status.delivered") },
    cancelled: { color: "text-rose-600", bg: "bg-rose-50", icon: <XCircle size={12} />, label: t("profile.orders.status.cancelled") },
});

const getStatus = (s: string, t: any) => {
    const map = getStatusMap(t);
    return map[s.toLowerCase() as keyof ReturnType<typeof getStatusMap>] || map.pending;
};

const OrdersTab: React.FC = () => {
    const { t } = useTranslation("profile");
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ordersApi.list().then((d) => { setOrders(d.results || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">My Orders</h2>
                        <p className="text-[11px] md:text-xs text-slate-400">Your recent purchases</p>
                    </div>
                </div>
                <Link to="/orders" className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1 self-end sm:self-auto">
                    {t("profile.orders.viewAll")} <ChevronRight size={14} className="rtl:rotate-180" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 sm:h-20 bg-slate-50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="text-slate-300" size={28} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-4">{t("profile.orders.empty")}</p>
                    <Link to="/products" className="inline-flex px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {orders.slice(0, 5).map((order) => {
                        const st = getStatus(order.status, t);
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group text-start"
                            >
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 flex-shrink-0">
                                        <Hash size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{t("profile.orders.orderNumber")}{order.id}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
                                            {" · "}
                                            {order.items.length} {order.items.length !== 1 ? (t("profile.orders.items_plural") || "items") : (t("profile.orders.items") || "item")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto sm:ms-auto border-t sm:border-none border-slate-50 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase shrink-0 ${st.color} ${st.bg}`}>
                                        {st.icon} {st.label}
                                    </span>
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <span className="text-sm font-black text-slate-900">AED {parseFloat(order.total_amount).toFixed(2)}</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-600 transition-colors hidden sm:block rtl:rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {orders.length > 5 && (
                        <Link to="/orders" className="block text-center text-xs font-bold text-cyan-600 hover:underline py-3">
                            {t("profile.orders.viewAllCount", { count: orders.length })}
                        </Link>
                    )}
                </div>
            )}
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════
   Addresses Tab
   ═══════════════════════════════════════════════ */
const AddressesTab: React.FC<{ onSuccess: (msg: string) => void; onError: (msg: string) => void }> = ({ onSuccess, onError }) => {
    const { t } = useTranslation("profile");
    const [addresses, setAddresses] = useState<AddressDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        label: "home", full_name: "", phone_number: "", building_name: "",
        flat_villa_number: "", street_address: "", area: "", city: "",
        emirate: "", country: "AE"
    });

    useEffect(() => {
        customersApi.listAddresses()
            .then((data) => { setAddresses(Array.isArray(data) ? data : data.results || []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const resetForm = () => setForm({
        label: "home", full_name: "", phone_number: "", building_name: "",
        flat_villa_number: "", street_address: "", area: "", city: "",
        emirate: "", country: "AE"
    });

    const handleSave = async () => {
        if (!form.full_name || !form.street_address) { onError(t("profile.messages.nameAndStreetRequired")); return; }
        setSaving(true);
        try {
            const newAddr = await customersApi.createAddress(form);
            setAddresses((prev) => [...prev, newAddr]);
            resetForm();
            setShowForm(false);
            onSuccess("Address added!");
        } catch { onError(t("profile.messages.failedToSaveAddress")); }
        finally { setSaving(false); }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await customersApi.setDefaultAddress(id);
            setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
            onSuccess("Default address updated!");
        } catch { onError(t("profile.messages.failedToUpdateDefaultAddress")); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Saved Addresses</h2>
                        <p className="text-[11px] md:text-xs text-slate-400">Manage your delivery addresses</p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors"
                    >
                        <Plus size={14} /> {t("profile.addresses.addAddress")}
                    </button>
                )}
            </div>

            {/* Add Address Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                                {/* Address Type */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("profile.addresses.type")}</label>
                                    <div className="relative">
                                        <select
                                            value={form.label}
                                            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                                            className="profile-field-input appearance-none"
                                        >
                                            <option value="home">Home</option>
                                            <option value="work">Work</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {([
                                    ["full_name", "Full Name", "John Doe"],
                                    ["phone_number", "Phone", "+971 50 123 4567"],
                                    ["building_name", "Building", "Al Reem Tower"],
                                    ["flat_villa_number", "Flat / Villa", "Apt 4B"],
                                    ["street_address", "Street", "123 Ocean Drive"],
                                    ["area", "Area", "Al Nahda"],
                                    ["city", "City", "Dubai"],
                                ] as [string, string, string][]).map(([key, label, ph]) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                                        <input
                                            value={form[key as keyof typeof form] as string}
                                            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                                            placeholder={ph}
                                            className="profile-field-input"
                                        />
                                    </div>
                                ))}

                                {/* Emirate */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("profile.addresses.emirate")}</label>
                                    <div className="relative">
                                        <select
                                            value={form.emirate}
                                            onChange={(e) => setForm((p) => ({ ...p, emirate: e.target.value }))}
                                            className="profile-field-input appearance-none"
                                        >
                                            <option value="">Select</option>
                                            {EMIRATES.map((em) => <option key={em.value} value={em.value}>{em.label}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-2">
                                <button
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? t("profile.personalInfo.saving") : t("profile.addresses.saveAddress")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Address List */}
            {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2].map((i) => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />)}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-slate-300" size={28} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No saved addresses</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="relative p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-white group flex flex-col h-full text-start">
                            <div className="flex items-center gap-2 mb-3">
                                {addr.label?.toLowerCase() === "home" ? <Home size={14} className="text-cyan-600" /> : <Briefcase size={14} className="text-cyan-600" />}
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">{addr.label?.toLowerCase() === "home" ? t("profile.addresses.home") : addr.label?.toLowerCase() === "work" ? t("profile.addresses.work") : addr.label ? t("profile.addresses.other") : ""}</span>
                                {addr.is_default && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md ms-auto">
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-slate-900">{addr.full_name}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {[addr.flat_villa_number, addr.building_name, addr.street_address].filter(Boolean).join(", ")}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {[addr.area, addr.city, addr.emirate].filter(Boolean).join(", ")}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{addr.phone_number}</p>

                            <div className="mt-auto pt-4">
                                {!addr.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="text-[11px] font-bold text-cyan-600 hover:underline inline-block"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════
   Shared UI Components
   ═══════════════════════════════════════════════ */
const InfoField = ({
    label, value, editing, onChange, placeholder, required
}: {
    label: string; value: string; editing: boolean; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ms-1 flex items-center gap-1">
            {label}
            {required && <span className="text-cyan-500">*</span>}
        </label>
        {editing ? (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="profile-field-input"
            />
        ) : (
            <div className="px-3 sm:px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700 break-words text-start">
                {value || "—"}
            </div>
        )}
    </div>
);

/* ── Field styles ── */
const style = document.createElement("style");
style.textContent = `
  .profile-field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #0f172a;
    outline: none;
    transition: all 0.2s ease;
  }
  .profile-field-input:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    background: #fff;
  }
  .profile-field-input::placeholder {
    color: #cbd5e1;
    font-weight: 400;
  }
  
  /* Hide scrollbar for mobile navigation while keeping it scrollable */
  .profile-hide-scrollbar::-webkit-scrollbar { 
    display: none; 
  }
  .profile-hide-scrollbar { 
    -ms-overflow-style: none; 
    scrollbar-width: none; 
  }
`;
if (!document.getElementById("profile-field-styles")) {
    style.id = "profile-field-styles";
    document.head.appendChild(style);
}

export default ProfilePage;