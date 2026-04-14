import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import logoUrl from "../../assets/LOGO-2.svg";

interface LogoAnimatedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

/**
 * Animated logo component using the 'LOGO-2.svg' asset.
 * Splits the logo in half so the two fishes move in from both sides and merge.
 */
const LogoAnimated = ({ className, ...props }: LogoAnimatedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftFishRef = useRef<HTMLImageElement>(null);
  const rightFishRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!leftFishRef.current || !rightFishRef.current || !containerRef.current) return;

    // Reset initial state to avoid flash
    gsap.set(leftFishRef.current, {
      opacity: 0,
      scale: 0.8,
      x: -50,
      filter: "blur(10px)"
    });

    gsap.set(rightFishRef.current, {
      opacity: 0,
      scale: 0.8,
      x: 50,
      filter: "blur(10px)"
    });

    const tl = gsap.timeline();

    // Cinematic reveal animation: fishes move in from both sides and merge
    tl.to([leftFishRef.current, rightFishRef.current], {
      opacity: 1,
      scale: 1,
      x: 0,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "power4.out",
    });

    // Gentle floating breathing effect on the container
    gsap.to(containerRef.current, {
      y: -8,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.4
    });

    return () => {
      gsap.killTweensOf(leftFishRef.current);
      gsap.killTweensOf(rightFishRef.current);
      gsap.killTweensOf(containerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      {/* Left Fish */}
      <img
        ref={leftFishRef}
        src={logoUrl}
        alt="SIMAK Logo Left"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
        style={{ clipPath: "inset(0 50% 0 0)" }}
        {...props}
      />
      {/* Right Fish */}
      <img
        ref={rightFishRef}
        src={logoUrl}
        alt="SIMAK Logo Right"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
        style={{ clipPath: "inset(0 0 0 50%)" }}
        {...props}
      />
    </div>
  );
};

export default LogoAnimated;