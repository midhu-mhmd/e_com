import React from "react";

interface QuickStatProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export const QuickStat: React.FC<QuickStatProps> = ({
  label,
  value,
  sub,
  icon,
  onClick,
  active = false,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`p-5 bg-white border rounded-2xl shadow-sm transition-all cursor-pointer ${
        active 
          ? "border-black ring-1 ring-black" 
          : "border-[#EEEEEE] hover:border-[#D4D4D8]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
      <p className="text-[11px] text-emerald-600 font-medium mt-1">{sub}</p>
    </div>
  );
};
