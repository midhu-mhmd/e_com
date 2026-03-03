import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Check,
  Timer,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AuthMethod } from "../../types/types";
import { requestOtp, verifyOtp, setMethod, setStep } from "../auth/authSlice";

/* ─── OTP Timer Hook ─── */
const useOtpTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((isInitial: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = isInitial ? 60 : 30;
    setSecondsLeft(duration);
    setResendCount((c) => c + 1);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(0);
    setResendCount(0);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { secondsLeft, resendCount, startTimer, reset, canResend: secondsLeft === 0 };
};

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { otp_type, step, isLoading, error, value, isAuthenticated, user } = useSelector(
    (s: any) => s.auth
  );

  const [focused, setFocused] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value || "");
  const [otp, setOtp] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { secondsLeft, startTimer, reset, canResend } = useOtpTimer();

  useEffect(() => setLocalValue(value || ""), [value]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const isAdmin = user.role === "admin" || user.is_admin === true;
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const isPhoneValid = useMemo(() => {
    const digits = localValue.replace(/\D/g, "");
    return digits.length >= 10;
  }, [localValue]);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localValue.trim());
  }, [localValue]);

  const canSendOtp =
    !isLoading &&
    agreeTerms &&
    (otp_type === "phone" ? isPhoneValid : isEmailValid);

  const canVerifyOtp = !isLoading && otp.trim().length === 6;

  const onSwitchMethod = (m: AuthMethod) => {
    setOtp("");
    setAgreeTerms(false);
    setLocalValue("");
    reset();
    dispatch(setMethod(m));
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSendOtp) return;

    dispatch(
      requestOtp({
        otp_type: otp_type,
        phone_number: otp_type === "phone" ? localValue.trim() : undefined,
        email: otp_type === "email" ? localValue.trim() : undefined,
      })
    );
    startTimer(true); // 60s for initial send
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canVerifyOtp) return;

    dispatch(
      verifyOtp({
        otp_type: otp_type,
        phone_number: otp_type === "phone" ? (value || localValue.trim()) : undefined,
        email: otp_type === "email" ? (value || localValue.trim()) : undefined,
        otp_code: otp.trim(),
      })
    );
  };

  const onChangeIdentity = () => {
    setOtp("");
    reset();
    dispatch(setStep("input"));
  };

  const onResendOtp = () => {
    if (isLoading || !canResend) return;
    const v = (value || localValue).trim();
    if (!v) return;

    dispatch(
      requestOtp({
        otp_type: otp_type,
        phone_number: otp_type === "phone" ? v : undefined,
        email: otp_type === "email" ? v : undefined,
      })
    );
    startTimer(false); // 30s for resend
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#18181B] font-sans antialiased flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-white">

      <div className="w-full max-w-95 relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-10 md:p-12 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-2">
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
                Welcome Back
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
                OTP Sign-in
              </p>
            </div>
          </header>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-50 p-1 border border-zinc-100">
            <button
              type="button"
              onClick={() => onSwitchMethod("phone")}
              className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.28em] transition ${otp_type === "phone"
                ? "bg-white shadow-sm text-cyan-600"
                : "text-zinc-400 hover:text-cyan-600"
                }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Phone size={14} /> Phone
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchMethod("email")}
              className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.28em] transition ${otp_type === "email"
                ? "bg-white shadow-sm text-cyan-600"
                : "text-zinc-400 hover:text-cyan-600"
                }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Mail size={14} /> Email
              </span>
            </button>
          </div>

          {/* INPUT STEP */}
          {step === "input" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-1">
                <div
                  className={`group relative border-b transition-all duration-500 py-3 ${focused === "id" ? "border-cyan-500" : "border-zinc-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {otp_type === "email" ? (
                      <Mail
                        size={14}
                        className={`${focused === "id" ? "text-cyan-600" : "text-zinc-300"
                          } transition-colors`}
                      />
                    ) : (
                      <Phone
                        size={14}
                        className={`${focused === "id" ? "text-cyan-600" : "text-zinc-300"
                          } transition-colors`}
                      />
                    )}

                    <input
                      type={otp_type === "email" ? "email" : "tel"}
                      required
                      placeholder={
                        otp_type === "email"
                          ? "Email Address"
                          : "Phone (e.g. +971 50xxxxxxx)"
                      }
                      value={localValue}
                      onFocus={() => setFocused("id")}
                      onBlur={() => setFocused(null)}
                      className="w-full bg-transparent outline-none text-sm font-medium tracking-tight placeholder:text-zinc-200"
                      onChange={(e) => setLocalValue(e.target.value)}
                    />
                  </div>
                </div>

                {/* Terms */}
                <label className="mt-4 flex items-start gap-3 cursor-pointer select-none">
                  <span className="relative mt-0.5 h-4 w-4 rounded-md border border-zinc-200 flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer absolute inset-0 opacity-0 cursor-pointer"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <Check
                      size={12}
                      strokeWidth={3}
                      className="opacity-0 peer-checked:opacity-100 transition-opacity text-cyan-600"
                    />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-relaxed">
                    I agree to Terms & Privacy
                  </span>
                </label>

                {error && (
                  <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-rose-700">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSendOtp}
                className="group relative w-full bg-cyan-600 text-white py-5 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-700"
              >
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                    {isLoading ? "Sending..." : "Send OTP"}
                  </span>
                  {!isLoading && (
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                </div>
              </button>
            </form>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  OTP sent to{" "}
                  <span className="text-cyan-600 font-black">
                    {value || localValue}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={onChangeIdentity}
                  className="mt-3 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-cyan-600 transition-colors"
                >
                  <RefreshCcw size={14} /> Change
                </button>
              </div>

              <div
                className={`group relative border-b transition-all duration-500 py-3 ${focused === "otp" ? "border-cyan-600" : "border-zinc-100"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setFocused("otp")}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-transparent outline-none text-sm font-medium tracking-[0.35em] text-center placeholder:text-zinc-200"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                  <p className="text-[11px] font-semibold text-rose-700">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!canVerifyOtp}
                className="group relative w-full bg-cyan-600 text-white py-5 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-700"
              >
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                    {isLoading ? "Verifying..." : "Verify"}
                  </span>
                  {!isLoading && (
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                </div>
              </button>

              {/* Resend OTP with Timer */}
              <button
                type="button"
                onClick={onResendOtp}
                disabled={isLoading || !canResend}
                className={`w-full py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.3em] transition-all ${canResend
                  ? "border-zinc-100 text-zinc-400 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200"
                  : "border-zinc-50 text-zinc-300 cursor-not-allowed"
                  }`}
              >
                {canResend ? (
                  "Resend OTP"
                ) : (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Timer size={14} />
                    Resend in {secondsLeft}s
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Alternatives */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                Auth Options
              </span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-3 border border-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 hover:text-black hover:border-zinc-200 transition-all"
              >
                Google
              </button>
              <button
                type="button"
                className="py-3 border border-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 hover:text-black hover:border-zinc-200 transition-all"
              >
                Apple
              </button>
            </div>
          </div>
        </div>

        {/* Outer Footer */}
        <footer className="text-center mt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            No account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-cyan-600 font-black border-b-2 border-zinc-100 hover:border-cyan-600 transition-all ml-1 pb-0.5"
            >
              Join the Network
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
