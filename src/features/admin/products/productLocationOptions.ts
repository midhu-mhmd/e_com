export interface ProductLocationOption {
    value: string;
    label: string;
}

export const PRODUCT_LOCATION_OPTIONS: ProductLocationOption[] = [
    { value: "abu_dhabi", label: "Abu Dhabi" },
    { value: "dubai", label: "Dubai" },
    { value: "sharjah", label: "Sharjah" },
    { value: "ajman", label: "Ajman" },
    { value: "umm_al_quwain", label: "Umm Al Quwain" },
    { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
    { value: "fujairah", label: "Fujairah" },
];

const LOCATION_OBJECT_KEYS = [
    "value",
    "slug",
    "name",
    "label",
    "zone",
    "emirate",
] as const;

export function extractProductLocationValues(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    const normalized = value
        .map((item) => {
            if (typeof item === "string") return item;

            if (item && typeof item === "object") {
                for (const key of LOCATION_OBJECT_KEYS) {
                    const candidate = (item as Record<string, unknown>)[key];
                    if (typeof candidate === "string") {
                        return candidate;
                    }
                }
            }

            return "";
        })
        .map((item) => item.trim())
        .filter(Boolean);

    return Array.from(new Set(normalized));
}

export function getProductLocationLabel(value: string): string {
    const normalizedValue = value.trim();
    const matchedOption = PRODUCT_LOCATION_OPTIONS.find(
        (option) => option.value === normalizedValue
    );

    if (matchedOption) {
        return matchedOption.label;
    }

    return normalizedValue
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
