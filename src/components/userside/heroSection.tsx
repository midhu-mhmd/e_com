import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBanners } from '../../hooks/queries';

const Hero: React.FC = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // ✅ TanStack Query — cached banners
  const { data: allBanners, isLoading: loading } = useBanners();

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
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (loading) {
    return (
      <div className="w-full h-[420px] bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">{t("hero.loading", "Loading amazing deals...")}</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show hero if no active banners
  }

  const media = banners[current];

  // API only values
  const title = media.title;
  const tag = media.tag;
  const subtitle = media.subtitle;
  const highlight = media.highlight;
  const cta = media.cta_text || null;

  /* 1. Background Animation (Slide) */
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-50%' : '50%', opacity: 1 }),
  };

  /* 2. Text Animation (Fade Only) */
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full bg-white font-sans text-slate-800 select-none pb-4">
      {/* ═══ HERO CAROUSEL ═══════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-0 sm:px-4 pt-2 sm:pt-4 group/carousel">
        <div
          className="relative h-[300px] sm:h-[360px] md:h-[420px] w-full overflow-hidden sm:rounded-[2rem] shadow-xl shadow-slate-200"
        >
          {/* LAYER 1: Background Image & Gradient (Moving) */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={media.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 } }}
              className="absolute inset-0 z-0"
            >
              <motion.img
                src={media.desktop_image}
                alt={title}
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 10, ease: 'linear' }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent sm:via-black/40 rtl:bg-gradient-to-l" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </motion.div>
          </AnimatePresence>

          {/* LAYER 2: Text Content (Static Position, Fading In/Out) */}
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
                  {/* Highlight Tag */}
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

                  {/* Title (no split — works for AR/ZH too) */}
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.1] mb-3 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
                      {title}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  {subtitle && (
                    <p className="text-sm sm:text-base text-slate-200 mb-4 max-w-lg leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                      {subtitle}
                    </p>
                  )}

                  {/* CTA Only */}
                  {cta && (
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button
                        onClick={() => navigate('/products')}
                        className="group relative px-6 py-3 bg-cyan-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {cta} <ChevronRight size={16} className="rtl-flip" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>



          {/* ✅ Progress Indicators: right-6 on mobile, resetting to left-12 on sm+ */}
          <div className="absolute bottom-6 end-6 sm:end-auto sm:start-12 md:start-20 lg:start-24 z-20 flex gap-2">
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
    </div>
  );
};

export default Hero;
