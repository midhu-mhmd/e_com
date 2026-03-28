import React from "react";
import { MapPin } from "lucide-react";
import { PRODUCT_LOCATION_OPTIONS } from "./productLocationOptions";

interface ProductLocationsFieldProps {
    selectedValues: string[];
    onToggle: (value: string) => void;
}

const ProductLocationsField: React.FC<ProductLocationsFieldProps> = ({
    selectedValues,
    onToggle,
}) => {
    const normalizedSelectedValues = Array.isArray(selectedValues)
        ? selectedValues.filter((value): value is string => typeof value === "string")
        : [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-[#18181B]">
                        Choose the emirates where this product is available.
                    </p>
                    <p className="text-xs text-[#71717A]">
                        Customers should only see this item in the selected locations.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F5] px-3 py-1 text-[11px] font-bold text-[#52525B]">
                    <MapPin size={12} />
                    {normalizedSelectedValues.length} selected
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {PRODUCT_LOCATION_OPTIONS.map((option) => {
                    const isSelected = normalizedSelectedValues.includes(option.value);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onToggle(option.value)}
                            aria-pressed={isSelected}
                            className="w-full text-left"
                        >
                            <div
                                className={`rounded-2xl border px-4 py-3 transition-all ${
                                    isSelected
                                        ? "border-black bg-black text-white shadow-lg shadow-black/10"
                                        : "border-[#E4E4E7] bg-[#FAFAFA] text-[#18181B] hover:border-[#18181B]/20"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold">{option.label}</p>
                                        <p
                                            className={`mt-1 text-[11px] ${
                                                isSelected ? "text-white/70" : "text-[#71717A]"
                                            }`}
                                        >
                                            {isSelected ? "Included in availability" : "Not selected"}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                            isSelected
                                                ? "bg-white/15 text-white"
                                                : "bg-white text-[#71717A]"
                                        }`}
                                    >
                                        {isSelected ? "On" : "Off"}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductLocationsField;
