import React, { useState, useCallback } from "react";
import {
    Mail,
    Phone,
    Send,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Headphones,
    Clock,
    MessageSquare,
    User,
    FileText,
} from "lucide-react";
import { api } from "../../services/api";

/* ─── Types ─── */
interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
}

type Status = "idle" | "sending" | "success" | "error";

/* ─── FAQ Data ─── */
const faqs = [
    {
        q: "How do I track my order?",
        a: "Once your order has been shipped, you'll receive a tracking link via email and SMS. You can also check the status from your Orders page in your account.",
    },
    {
        q: "What is your return & refund policy?",
        a: "We accept returns within 7 days of delivery for most items. The product must be unused and in its original packaging. Refunds are processed within 3–5 business days.",
    },
    {
        q: "How long does delivery take?",
        a: "Standard delivery within the UAE takes 2–4 business days. Express delivery (same-day or next-day) is available in select areas.",
    },
    {
        q: "Can I change or cancel my order?",
        a: "You can modify or cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be changed.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, Apple Pay, Cash on Delivery (COD), and bank transfers.",
    },
];

/* ─── FAQ Item ─── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-zinc-100 rounded-2xl overflow-hidden transition-all hover:border-zinc-200">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer group"
            >
                <span className="text-sm font-semibold text-zinc-800 group-hover:text-cyan-600 transition-colors pr-4">
                    {q}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-zinc-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-cyan-600" : ""}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
            >
                <p className="px-6 pb-5 text-[13px] text-zinc-500 leading-relaxed">
                    {a}
                </p>
            </div>
        </div>
    );
};

/* ─── Support Page ─── */
const SupportPage: React.FC = () => {
    const [form, setForm] = useState<ContactForm>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        []
    );

    const isFormValid =
        form.name.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        form.subject.trim().length > 2 &&
        form.message.trim().length > 10;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setStatus("sending");
        setErrorMsg("");

        try {
            await api.post("/support/contact/", {
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim(),
                message: form.message.trim(),
            });
            setStatus("success");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    const inputBase =
        "w-full bg-transparent border-b border-zinc-100 py-3 text-sm font-medium tracking-tight placeholder:text-zinc-300 outline-none transition-all focus:border-cyan-500";

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#18181B] font-sans antialiased selection:bg-cyan-500 selection:text-white">
            {/* ─── Hero Section ─── */}
            <section className="relative bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-400 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-6">
                        <Headphones size={14} /> Support Center
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        How can we help you?
                    </h1>
                    <p className="mt-4 text-white/70 text-sm md:text-base max-w-xl mx-auto">
                        Our team is here to assist you. Reach out via email or give us a
                        call — we're happy to help.
                    </p>
                </div>
            </section>

            {/* ─── Main Content ─── */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 pb-20 relative z-10">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ─── Contact Form (spans 2 cols on large) ─── */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                                <MessageSquare size={18} className="text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">
                                    Send us a message
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                    We'll get back to you within 24 hours
                                </p>
                            </div>
                        </div>

                        {status === "success" ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900">
                                    Message Sent!
                                </h3>
                                <p className="text-sm text-zinc-500 max-w-xs">
                                    Thank you for reaching out. We'll get back to you as soon as
                                    possible.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setStatus("idle")}
                                    className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                                            Full Name
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <User
                                                size={14}
                                                className="text-zinc-300 shrink-0"
                                            />
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={onChange}
                                                placeholder="Your name"
                                                required
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Mail
                                                size={14}
                                                className="text-zinc-300 shrink-0"
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={onChange}
                                                placeholder="you@example.com"
                                                required
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                                        Subject
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <FileText
                                            size={14}
                                            className="text-zinc-300 shrink-0"
                                        />
                                        <input
                                            type="text"
                                            name="subject"
                                            value={form.subject}
                                            onChange={onChange}
                                            placeholder="What is this about?"
                                            required
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={onChange}
                                        placeholder="Describe your issue or question in detail..."
                                        required
                                        rows={5}
                                        className={`${inputBase} resize-none`}
                                    />
                                </div>

                                {/* Error */}
                                {status === "error" && (
                                    <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                                        <AlertCircle size={16} className="text-rose-500 shrink-0" />
                                        <p className="text-[11px] font-bold text-rose-600">
                                            {errorMsg}
                                        </p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={!isFormValid || status === "sending"}
                                    className="group relative w-full bg-cyan-600 text-white py-5 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-700 cursor-pointer"
                                >
                                    <div className="relative flex items-center justify-center gap-2">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                                            {status === "sending" ? "Sending..." : "Send Message"}
                                        </span>
                                        {status === "sending" ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send
                                                size={16}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        )}
                                    </div>
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ─── Sidebar: Call Support + Info ─── */}
                    <div className="space-y-6">
                        {/* Call Support Card */}
                        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Phone size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-zinc-900">
                                        Call Support
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                        Speak to our team
                                    </p>
                                </div>
                            </div>

                            <a
                                href="tel:+971800123456"
                                className="block w-full text-center bg-emerald-600 text-white py-4 rounded-2xl text-sm font-bold tracking-wide hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Phone size={16} />
                                    +971 800 123 456
                                </span>
                            </a>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock size={14} className="text-zinc-300" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            Working Hours
                                        </p>
                                        <p className="text-xs font-medium text-zinc-600">
                                            Sat – Thu: 9 AM – 9 PM
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-zinc-300" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            Email Us
                                        </p>
                                        <a
                                            href="mailto:support@example.com"
                                            className="text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
                                        >
                                            support@example.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info Card */}
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[2rem] p-8 text-white">
                            <h3 className="text-base font-semibold mb-3">
                                Need urgent help?
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                For order-related issues, visit your{" "}
                                <a
                                    href="/orders"
                                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                                >
                                    Orders page
                                </a>{" "}
                                for quick actions like cancellation or return requests.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                <Headphones size={14} />
                                Average response: under 2 hours
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── FAQ Section ─── */}
                <div className="mt-16">
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">
                            <FileText size={14} /> Frequently Asked
                        </span>
                        <h2 className="text-2xl font-semibold text-zinc-900">
                            Common Questions
                        </h2>
                    </div>
                    <div className="max-w-2xl mx-auto space-y-3">
                        {faqs.map((faq, i) => (
                            <FaqItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
