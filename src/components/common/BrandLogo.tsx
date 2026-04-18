import React from "react";
import simakLogo from "../../assets/SIMAK FRESH FINAL LOGO-01 (1).png";

interface BrandLogoProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo = ({ size = 60, className = "", style = {} }: BrandLogoProps) => {
  return (
    <img 
      src={simakLogo} 
      alt="Simak Fresh Logo"
      className={className}
      style={{ 
        height: size, 
        width: "auto", 
        objectFit: "contain",
        ...style 
      }}
    />
  );
};
