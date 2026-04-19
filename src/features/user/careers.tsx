import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Briefcase, Mail, Users, Zap, Heart } from "lucide-react";

const CareersPage: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 rounded-4xl bg-white p-10 shadow-lg border border-slate-200">
          <div className="mb-6 text-sm uppercase tracking-[0.24em] text-cyan-600 font-bold">
            {t("careers.title", "Join Our Team")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6">
            {t("careers.heading", "Build Your Future at SIMAK FRESH")}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {t(
              "careers.intro",
              "We're looking for passionate, dedicated professionals to join our growing team. Whether you're in operations, logistics, customer service, or marketing, we offer an environment where your expertise helps deliver premium seafood to thousands of families and businesses across the region."
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-4xl bg-white p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("careers.whyJoinTitle", "Why Join SIMAK FRESH")}</h2>
            <ul className="space-y-4 text-slate-600">
              {[
                {
                  icon: <Zap size={18} className="text-cyan-600" />,
                  title: t("careers.innovationTitle", "Innovation & Growth"),
                  description: t(
                    "careers.innovationText",
                    "Be part of a fast-growing company expanding across the region with cutting-edge logistics and customer service."
                  ),
                },
                {
                  icon: <Heart size={18} className="text-cyan-600" />,
                  title: t("careers.cultureTitle", "Inclusive Culture"),
                  description: t(
                    "careers.cultureText",
                    "We value diversity, respect, and collaboration. Your voice matters and your ideas shape our future."
                  ),
                },
                {
                  icon: <Users size={18} className="text-cyan-600" />,
                  title: t("careers.teamTitle", "Strong Team"),
                  description: t(
                    "careers.teamText",
                    "Work alongside professionals who are passionate about quality, service excellence, and seafood expertise."
                  ),
                },
                {
                  icon: <Briefcase size={18} className="text-cyan-600" />,
                  title: t("careers.opportunityTitle", "Career Development"),
                  description: t(
                    "careers.opportunityText",
                    "Grow your skills and advance your career with competitive benefits and professional development opportunities."
                  ),
                },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="mt-1 rounded-2xl bg-cyan-50 p-3 text-cyan-700">{item.icon}</div>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-4xl bg-white p-8 shadow-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("careers.applyTitle", "Ready to Apply?")}</h2>
          <p className="text-slate-600 mb-6 leading-7">
            {t(
              "careers.applyText",
              "We'd love to hear from you! Send your CV and a brief message about yourself and why you'd like to join our team. Tell us what's unique about you and how you can contribute to SIMAK FRESH's mission of delivering quality seafood with excellence."
            )}
          </p>
          <div className="rounded-3xl bg-cyan-50 p-6 border border-cyan-100">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={20} className="text-cyan-700" />
              <p className="text-sm font-bold text-cyan-900">{t("careers.emailLabel", "Send Your Application To:")}</p>
            </div>
            <a
              href="mailto:careers@simakfresh.ae"
              className="inline-block text-lg font-bold text-cyan-700 hover:text-cyan-800 break-all"
            >
              careers@simakfresh.ae
            </a>
            <p className="text-xs text-cyan-600 mt-4">
              {t(
                "careers.emailHint",
                "Include your CV, contact details, and a message about your experience and interest in joining SIMAK FRESH."
              )}
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 rounded-4xl bg-cyan-950 p-8 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-bold">
              {t("careers.ctaTitle", "Let's Build Something Great")}
            </p>
            <p className="mt-3 text-lg font-bold max-w-2xl">
              {t("careers.ctaText", "Join a team dedicated to bringing the world's freshest seafood to your doorstep.")}
            </p>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-cyan-950 hover:bg-yellow-400 transition-all"
          >
            {t("careers.learnMore", "Learn About Us")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CareersPage;
