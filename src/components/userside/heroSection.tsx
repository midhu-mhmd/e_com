import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight, Sparkles, Zap, ShieldCheck, Clock, Gift, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBanners, useDeliveryOffers } from '../../hooks/queries';
import { BRAND_COLORS } from '../../constants/theme';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [, setDirection] = useState(1);
  const isRtl = i18n.dir() === 'rtl';

  const { data: allBanners, isLoading: loading } = useBanners();
  const { data: deliveryOffers = [] } = useDeliveryOffers(i18n.language);

  // Colorful variants for the items
  const itemStyles = [
    { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'bg-rose-100', border: 'border-rose-100', iconComp: Sparkles },
    { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100', border: 'border-amber-100', iconComp: Zap },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100', border: 'border-emerald-100', iconComp: ShieldCheck },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100', border: 'border-cyan-100', iconComp: Clock },
    { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-100', border: 'border-violet-100', iconComp: Gift },
    { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100', border: 'border-blue-100', iconComp: ShoppingBag },
  ];

  const banners = useMemo(() => {
    if (!allBanners) return [];
    return allBanners.filter(b => b.position === 'home_banner' && b.is_active);
  }, [allBanners]);

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrent((p) => (p + 1) % banners.length);
  }, [banners.length]);

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  const media = banners[current];
  const title = media?.title;
  const subtitle = media?.subtitle;
  const highlight = media?.highlight;
  const tag = media?.tag;
  const cta = media?.cta_text || null;

  const promoTickerItems = useMemo(() => {
    const items = deliveryOffers.map((m) => String(m).trim()).filter(Boolean);
    return items.length > 0 ? items : [
      t('hero.promoOne', 'Fast UAE Delivery'),
      t('hero.promoTwo', 'Daily Fresh Deals'),
      t('hero.promoThree', 'Verified Quality'),
      t('hero.promoFour', 'Easy 7-Day Returns')
    ];
  }, [deliveryOffers, t]);

  if (loading) return (
    <div className="w-full h-105 bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full bg-white font-sans text-slate-800 select-none pb-4">
      {/* Banner - Kept original */}
      {banners.length > 0 && (
        <section className="relative w-full mx-auto px-0 sm:px-4 pt-2 sm:pt-4 group/carousel">
          <div className="relative h-75 sm:h-90 md:h-105 w-full overflow-hidden sm:rounded-4xl shadow-xl shadow-slate-200" style={{ backgroundColor: BRAND_COLORS.BLACK }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={media.id}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 z-0"
              >
                <img src={media.desktop_image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent rtl:bg-linear-to-l" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 pointer-events-none">
              <div className="max-w-2xl pointer-events-auto">
                <AnimatePresence mode="wait">
                  <motion.div key={media.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="inline-flex items-center gap-2 mb-4">
                      {highlight && <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold uppercase rounded-full">{highlight}</span>}
                      {tag && <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1 rounded-full">{tag}</span>}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-3">
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-slate-200">{title}</span>
                    </h1>
                    {subtitle && <p className="text-sm sm:text-base text-slate-200 mb-4 max-w-lg line-clamp-2">{subtitle}</p>}
                    {cta && (
                      <button onClick={() => navigate('/products')} className="px-6 py-3 bg-cyan-600 text-white rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-600/30">
                        {cta} <ChevronRight size={16} className="rtl-flip" />
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-6 inset-e-6 sm:inset-e-auto sm:inset-s-12 md:inset-s-20 lg:inset-s-24 z-20 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-cyan-500' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW COLORFUL BEAUTIFUL SCROLL */}
      {promoTickerItems.length > 0 && (
        <div className="relative mt-6 overflow-hidden">
          <div className="py-2">
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="beautiful-ticker-track flex items-center w-max"
            >
              {[0, 1, 2].map((groupIndex) => (
                <div key={groupIndex} className="flex items-center">
                  {promoTickerItems.map((message, index) => {
                    const style = itemStyles[index % itemStyles.length];
                    const Icon = style.iconComp;
                    return (
                      <div
                        key={`${groupIndex}-${index}`}
                        className={`flex items-center gap-3 mx-2.5 px-5 py-3 rounded-2xl border ${style.bg} ${style.border} shadow-sm transition-transform hover:scale-105 duration-300`}
                      >
                        <div className={`p-2 rounded-xl ${style.icon} ${style.text}`}>
                          <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <span className={`text-sm md:text-base font-bold whitespace-nowrap ${style.text}`}>
                          {message}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .beautiful-ticker-track {
          display: flex;
          animation: colorful-loop 40s linear infinite;
        }

        @keyframes colorful-loop {
          0% { transform: translateX(0); }
          100% {
            transform: ${isRtl ? 'translateX(33.333%)' : 'translateX(-33.333%)'};
          }
        }

        .beautiful-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Hero;
