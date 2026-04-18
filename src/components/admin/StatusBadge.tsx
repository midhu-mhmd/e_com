import React from "react";
import { BRAND_COLORS } from "../../constants/theme";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status.toLowerCase();
  
  const map: Record<string, { bg: string; color: string }> = {
    delivered: { bg: `${BRAND_COLORS.CYAN}18`, color: BRAND_COLORS.CYAN_DARK },
    processing: { bg: `${BRAND_COLORS.CYAN}08`, color: BRAND_COLORS.CYAN_MEDIUM },
    pending: { bg: "#F1F5F9", color: "#64748B" },
    shipped: { bg: `${BRAND_COLORS.CYAN}12`, color: BRAND_COLORS.CYAN },
    paid: { bg: `${BRAND_COLORS.CYAN}15`, color: BRAND_COLORS.CYAN_MEDIUM },
    cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  };

  const style = map[s] ?? { bg: "#F1F5F9", color: "#64748B" };

  return (
    <span
      className="inline-block px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm"
      style={{ background: style.bg, color: style.color }}
    >
      {s}
    </span>
  );
};

export default StatusBadge;
