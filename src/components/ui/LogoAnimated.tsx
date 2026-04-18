import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { BRAND_COLORS } from "../../constants/theme";
import { BRAND_LOGO_PATHS, BRAND_TEXT_PATHS } from "../../constants/brandAssets";

interface LogoAnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  mergeDuration?: number;
}

const LogoAnimated = ({ className, mergeDuration = 1.6, ...props }: LogoAnimatedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const redFishRef = useRef<SVGPathElement>(null);
  const greenFishRef = useRef<SVGPathElement>(null);
  const fullLogoRef = useRef<SVGGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redFish = redFishRef.current;
    const greenFish = greenFishRef.current;
    const fullLogo = fullLogoRef.current;
    const glow = glowRef.current;

    if (!redFish || !greenFish || !fullLogo || !glow) return;

    gsap.set(redFish, { x: -300, opacity: 0, scale: 0.8 });
    gsap.set(greenFish, { x: 300, opacity: 0, scale: 0.8 });
    gsap.set(fullLogo, { opacity: 0 });
    gsap.set(glow, { scale: 0, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    tl.to([redFish, greenFish], {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: mergeDuration,
      stagger: 0.1,
      ease: "expo.out"
    })
    .to(glow, {
      scale: 2,
      opacity: 0.6,
      duration: 0.2,
      ease: "power2.out"
    }, "-=0.2")
    .to(glow, {
      scale: 4,
      opacity: 0,
      duration: 0.5
    })
    .to(fullLogo, {
      opacity: 1,
      duration: 0.5
    }, "-=0.5");

    gsap.to(containerRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      tl.kill();
    };
  }, [mergeDuration]);

  return (
    <div 
      ref={containerRef} 
      className={`relative flex items-center justify-center ${className || ""}`}
      {...props}
    >
      <div 
        ref={glowRef}
        className="absolute w-20 h-20 bg-cyan-400 rounded-full blur-3xl pointer-events-none z-0"
        style={{ opacity: 0 }}
      />

      <svg 
        viewBox="0 0 1169 745" 
        className="w-full h-full relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F6DE37">
              <animate attributeName="offset" values="-1; 1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#ffffff">
              <animate attributeName="offset" values="0; 2" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#F6DE37">
              <animate attributeName="offset" values="1; 3" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <g transform="translate(374.943359375,249.921875)">
          <path
            ref={redFishRef}
            fill={BRAND_COLORS.RED}
            d={BRAND_LOGO_PATHS.RED_FISH}
          />
          <path
            ref={greenFishRef}
            fill={BRAND_COLORS.CYAN}
            d={BRAND_LOGO_PATHS.CYAN_FISH}
          />

          <g ref={fullLogoRef} style={{ filter: `
            drop-shadow(0 0 10px ${BRAND_COLORS.CYAN}66) 
            drop-shadow(0 0 20px ${BRAND_COLORS.GOLD}33)
            drop-shadow(0 4px 8px rgba(0,0,0,0.6))
          ` }}>
            <path d={BRAND_LOGO_PATHS.GOLDEN_FIN} fill={BRAND_COLORS.GOLD} transform="translate(-41.943359375,75.078125)"/>
            
            <g fill="url(#wowGradient)">
              <path d={BRAND_TEXT_PATHS.S} transform="translate(273.056640625,10.078125)"/>
              <path d={BRAND_TEXT_PATHS.I} transform="translate(236.056640625,10.078125)"/>
              <path d={BRAND_TEXT_PATHS.M} transform="translate(235.056640625,111.078125)"/>
              <path d={BRAND_TEXT_PATHS.A} transform="translate(394.056640625,10.078125)"/>
              <path d={BRAND_TEXT_PATHS.K} transform="translate(458.056640625,10.078125)"/>
              <path d={BRAND_TEXT_PATHS.F} transform="translate(453.056640625,111.078125)"/>
              <path d={BRAND_TEXT_PATHS.R} transform="translate(394.056640625,10.078125)"/>
              <path d={BRAND_TEXT_PATHS.E} transform="translate(314.056640625,111.078125)"/>
              <path d={BRAND_LOGO_PATHS.S_TEXT_ALT} transform="translate(438.056640625,112.078125)"/>
              <path d={BRAND_LOGO_PATHS.H_TEXT} transform="translate(453.056640625,111.078125)"/>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default LogoAnimated;