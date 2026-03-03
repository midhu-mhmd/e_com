import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ShieldCheck,
  Truck,
  ThermometerSnowflake,
  Fish,
  Clock,
  BadgeCheck,
  Star,
  Leaf,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const TrustSection: React.FC = () => {
  const { t } = useTranslation("home");

  // Trust badges (text from i18n)
  const trustBadges = useMemo(
    () => [
      {
        icon: <ThermometerSnowflake size={28} />,
        title: t("trust.badges.coldChain.title"),
        desc: t("trust.badges.coldChain.desc"),
        color: "bg-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-100",
      },
      {
        icon: <Fish size={28} />,
        title: t("trust.badges.freshCatch.title"),
        desc: t("trust.badges.freshCatch.desc"),
        color: "bg-yellow-500",
        bg: "bg-yellow-50",
        border: "border-yellow-100",
      },
      {
        icon: <Truck size={28} />,
        title: t("trust.badges.sameDay.title"),
        desc: t("trust.badges.sameDay.desc"),
        color: "bg-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-100",
      },
      {
        icon: <ShieldCheck size={28} />,
        title: t("trust.badges.quality.title"),
        desc: t("trust.badges.quality.desc"),
        color: "bg-yellow-500",
        bg: "bg-yellow-50",
        border: "border-yellow-100",
      },
      {
        icon: <Clock size={28} />,
        title: t("trust.badges.returns.title"),
        desc: t("trust.badges.returns.desc"),
        color: "bg-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-100",
      },
      {
        icon: <Leaf size={28} />,
        title: t("trust.badges.sustainable.title"),
        desc: t("trust.badges.sustainable.desc"),
        color: "bg-yellow-500",
        bg: "bg-yellow-50",
        border: "border-yellow-100",
      },
    ],
    [t]
  );

  const stats = useMemo(
    () => [
      { value: "25,000+", label: t("trust.stats.happyCustomers") },
      { value: "50+", label: t("trust.stats.varieties") },
      { value: "4.8★", label: t("trust.stats.avgRating") },
      { value: "98%", label: t("trust.stats.onTimeDelivery") },
    ],
    [t]
  );

  return (
    <section className="relative overflow-hidden bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 rounded-full mb-4">
            <BadgeCheck size={14} className="text-cyan-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-800">
              {t("trust.kicker")}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            {t("trust.title")}{" "}
            <span className="text-cyan-600">{t("trust.titleHighlight")}</span>
          </h2>

          <p className="mt-4 text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            {t("trust.subtitle")}
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {trustBadges.map((badge, i) => (
            <TrustCard key={i} badge={badge} index={i} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="relative rounded-3xl bg-cyan-950 p-8 sm:p-12 overflow-hidden">
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedStat key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>

        {/* Review */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <p className="text-zinc-600 text-sm italic max-w-lg mx-auto leading-relaxed">
            {t("trust.review.quote")}
          </p>

          <p className="mt-3 text-xs font-bold text-zinc-800">
            {t("trust.review.author")}
          </p>

          <p className="text-[10px] text-zinc-400 mt-1">
            {t("trust.review.verified")}
          </p>
        </div>
      </div>
    </section>
  );
};

/* Trust Card */
interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

const TrustCard: React.FC<{ badge: TrustBadge; index: number }> = ({
  badge,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative ${badge.bg} ${badge.border} border rounded-2xl p-6 flex flex-col items-center text-center sm:items-start sm:text-left transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`inline-flex p-3 rounded-xl ${badge.color} text-white shadow-md mb-4`}
      >
        {badge.icon}
      </div>

      <h3 className="text-sm font-bold text-zinc-900 mb-1">{badge.title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{badge.desc}</p>
    </div>
  );
};

/* Animated Stat */
const AnimatedStat: React.FC<{
  stat: { value: string; label: string };
  index: number;
}> = ({ stat, index }) => {
  return (
    <div
      className="text-center transition-all duration-700 opacity-100 translate-y-0"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <p className="text-2xl sm:text-3xl font-extrabold text-yellow-400">
        {stat.value}
      </p>
      <p className="text-xs text-zinc-400 mt-1 font-medium tracking-wide uppercase">
        {stat.label}
      </p>
    </div>
  );
};

export default TrustSection;