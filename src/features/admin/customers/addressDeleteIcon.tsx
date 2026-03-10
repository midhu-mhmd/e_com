import React from "react";
import { X } from "lucide-react";

export const AddressDeleteIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Delete Address"
    className="absolute top-3 right-3 p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors shadow-sm z-10"
  >
    <X size={18} />
  </button>
);
