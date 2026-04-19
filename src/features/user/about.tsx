import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Globe, Sparkles, ShieldCheck } from "lucide-react";

const AboutPage: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 rounded-4xl bg-white p-10 shadow-lg border border-slate-200">
          <div className="mb-6 text-sm uppercase tracking-[0.24em] text-cyan-600 font-bold">
            {t("about.title", "About Us")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6">
            {t("about.heading", "From Dubai roots to global seafood expertise")}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            {t(
              "about.intro",
              "Since 2016, we have established a strong presence in the seafood industry, operating across import, export, farming, retail, and wholesale. Having begun our journey in the Dubai market, we are now expanding into new horizons with SIMAK FRESH, bringing our expertise and passion for quality to a global scale."
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-4xl bg-white p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("about.ourMissionTitle", "Our Mission")}</h2>
            <p className="text-slate-600 leading-7 mb-4">
              {t(
                "about.ourMissionText",
                "We deliver the freshest seafood with complete transparency, exceptional service, and a commitment to sustainability. Every product is carefully sourced, expertly handled, and delivered with the quality our customers expect."
              )}
            </p>
            <p className="text-slate-600 leading-7">
              {t(
                "about.ourMissionText2",
                "SIMAK FRESH is built on trust, reliability, and the belief that premium seafood should be available to families, restaurants, and retailers across the region and beyond."
              )}
            </p>
          </section>

          <section className="rounded-4xl bg-white p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("about.whyChooseUsTitle", "Why Choose SIMAK FRESH")}</h2>
            <ul className="space-y-4 text-slate-600">
              {[
                {
                  icon: <MapPin size={18} className="text-cyan-600" />,
                  title: t("about.expertsInSeafood", "Seafood expertise across every sector"),
                  description: t(
                    "about.expertsInSeafoodText",
                    "Import, export, farming, retail, and wholesale are all part of our integrated supply chain."
                  ),
                },
                {
                  icon: <Globe size={18} className="text-cyan-600" />,
                  title: t("about.globalAmbition", "Built in Dubai, expanding globally"),
                  description: t(
                    "about.globalAmbitionText",
                    "Starting in Dubai, we’re now taking our premium seafood capabilities to new markets with SIMAK FRESH."
                  ),
                },
                {
                  icon: <Sparkles size={18} className="text-cyan-600" />,
                  title: t("about.qualityPromise", "Quality you can trust"),
                  description: t(
                    "about.qualityPromiseText",
                    "From catch to kitchen, every order is cleaned, packed, and delivered with the freshness and care you deserve."
                  ),
                },
                {
                  icon: <ShieldCheck size={18} className="text-cyan-600" />,
                  title: t("about.commitmentToService", "Commitment to exceptional service"),
                  description: t(
                    "about.commitmentToServiceText",
                    "We make seafood shopping easy, reliable, and enjoyable for customers, partners, and businesses alike."
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
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("about.sectorsTitle", "Our Presence")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Import",
              "Export",
              "Farming",
              "Retail",
              "Wholesale",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-cyan-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 rounded-4xl bg-cyan-950 p-8 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-bold">
              {t("about.joinUsTitle", "Experience SIMAK FRESH")}
            </p>
            <p className="mt-3 text-lg font-bold max-w-2xl">
              {t(
                "about.joinUsText",
                "Join us on our journey to redefine seafood freshness, quality, and trust across the world."
              )}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-cyan-950 hover:bg-yellow-400 transition-all"
          >
            {t("about.shopNow", "Shop Fresh Seafood")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
