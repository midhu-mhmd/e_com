import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBanners, useDeliveryOffers } from '../../hooks/queries';
import { BRAND_COLORS } from '../../constants/theme';

const Hero: React.FC = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [, setDirection] = useState(1);

  const { data: allBanners, isLoading: loading } = useBanners();
  const { data: deliveryOffers = [], isLoading: deliveryOffersLoading } = useDeliveryOffers();

  const banners = useMemo(() => {
    if (!allBanners) return [];
    return allBanners.filter(b => {
      // Show 'home_banner' types in the carousel
      const isHomeBanner = b.position === 'home_banner';
      return b.is_active && isHomeBanner;
    });
  }, [allBanners]);

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrent((p) => (p + 1) % banners.length);
  }, [banners.length]);


  const goTo = useCallback(
    (i: number) => {
      setDirection(i > current ? 1 : -1);
      setCurrent(i);
    },
    [current]
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  const media = banners[current];
  const title = media?.title;
  const tag = media?.tag;
  const subtitle = media?.subtitle;
  const highlight = media?.highlight;
  const cta = media?.cta_text || null;

  const promoTickerItems = useMemo(() => {
    if (deliveryOffers.length === 0) return [];

    const items = deliveryOffers
      .map((offer) => offer.tickerText)
      .map((message) => message.trim())
      .filter(Boolean);

    return items.length > 0 ? [...items, ...items] : [];
  }, [deliveryOffers]);

  if (loading) {
    return (
      <div className="w-full h-105 bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">{t("hero.loading", "Loading amazing deals...")}</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const zoomVariants = {
    enter: { scale: 1.1, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  };


  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full bg-white font-sans text-slate-800 select-none pb-4">
      <section className="relative w-full  mx-auto px-0 sm:px-4 pt-2 sm:pt-4 group/carousel">
        <div
          className="relative h-75 sm:h-90 md:h-105 w-full overflow-hidden sm:rounded-4xl shadow-xl shadow-slate-200"
          style={{ backgroundColor: BRAND_COLORS.BLACK }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={media.id}
              variants={zoomVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                opacity: { duration: 1.2 },
                scale: { duration: 1.6, ease: [0.22, 1, 0.36, 1] }
              }}
              className="absolute inset-0 z-0"
            >
              <motion.img
                src={media.desktop_image}
                alt={title}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 40, ease: 'easeOut' }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent sm:via-black/40 rtl:bg-linear-to-l" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </motion.div>
          </AnimatePresence>


          <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 pointer-events-none">
            <div className="max-w-2xl pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={media.id}
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3"
                >

                  <div className="inline-flex items-center gap-2 mb-4">
                    {highlight && (
                      <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-yellow-500/20">
                        {highlight}
                      </span>
                    )}
                    {tag && (
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    )}
                  </div>


                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.1] mb-3 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-slate-200">
                      {title}
                    </span>
                  </h1>


                  {subtitle && (
                    <p className="text-sm sm:text-base text-slate-200 mb-4 max-w-lg leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                      {subtitle}
                    </p>
                  )}


                  {cta && (
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button
                        onClick={() => navigate('/products')}
                        className="group relative px-6 py-3 bg-cyan-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {cta} <ChevronRight size={16} className="rtl-flip" />
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-600 to-cyan-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>




          <div className="absolute bottom-6 inset-e-6 sm:inset-e-auto sm:inset-s-12 md:inset-s-20 lg:inset-s-24 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-cyan-500' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {(deliveryOffersLoading || promoTickerItems.length > 0) && (
        <div className="px-0 sm:px-4 mt-2 sm:mt-3">
          <div className="border border-slate-200 bg-slate-50 sm:rounded-2xl overflow-hidden">
            {deliveryOffersLoading && promoTickerItems.length === 0 ? (
              <div className="flex items-center gap-2 w-max px-2 py-2.5 sm:px-3 sm:py-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-300 shrink-0 animate-pulse"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                    <span>Loading offers</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="promo-ticker-track flex items-center gap-2 w-max px-2 py-2.5 sm:px-3 sm:py-3">
                {promoTickerItems.map((message, index) => (
                  <div
                    key={`${message}-${index}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 shrink-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .promo-ticker-track {
          animation: heroPromoTicker 24s linear infinite;
          will-change: transform;
        }

        .promo-ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes heroPromoTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;
