import api from "../../../services/api";
import { API_BASE_URL } from "../../../config/constants";

export interface BannerDto {
    id: number;
    key: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    tag?: string | null;
    highlight?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    desktop_image: string;
    mobile_image?: string | null;
    price_text?: string | null;
    old_price_text?: string | null;
    is_active: boolean;
    order: number;
    link?: string; // Standard API field
    image?: string; // Standard API field
    position?: string; // Standard API field
    start_at?: string | null;
    end_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

// ✅ Helper to convert relative image paths to absolute URLs + sanitize quotes/backticks
const getAbsoluteImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    const cleanedRaw = String(imagePath).trim().replace(/^['"`]+|['"`]+$/g, "");
    if (!cleanedRaw) return '';
    if (cleanedRaw.startsWith('http')) return cleanedRaw;
    const cleanPath = cleanedRaw.startsWith('/') ? cleanedRaw : `/${cleanedRaw}`;
    const baseUrl = API_BASE_URL || '/api';
    const apiDomain = import.meta.env.VITE_API_DOMAIN || window.location.origin;

    // Construct full URL: domain + api base path + image path
    return `${apiDomain}${baseUrl}${cleanPath}`;
};

const normalizeBannerPosition = (position?: string | null): string => {
    if (position === 'home_hero' || !position) return 'home_banner';
    return position;
};

export const bannerApi = {
    list: async (): Promise<BannerDto[]> => {
        const response = await api.get<{ results: any[] }>("/marketing/media/");
        const results = response.data.results || [];
        // Map backend fields to frontend format
        return results.map((item: any) => ({
            id: item.id,
            key: item.key,
            title: item.title,
            subtitle: item.subtitle || null,
            description: item.description || null,
            tag: item.tag || null,
            highlight: typeof item.highlight === "string" ? item.highlight : (item.highlight ? String(item.highlight) : null),
            cta_text: item.cta || item.cta_text || null,
            cta_link: item.link || item.cta_link || null,
            desktop_image: getAbsoluteImageUrl(item.image_desktop || item.image || item.desktop_image),
            mobile_image: getAbsoluteImageUrl(item.image_mobile || item.mobile_image),
            price_text: item.price_text || null,
            old_price_text: item.old_price_text || null,
            is_active: item.is_active ?? true,
            order: item.sort_order ?? item.order ?? item.id,
            position: normalizeBannerPosition(item.position),
            start_at: item.start_at || null,
            end_at: item.end_at || null,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    },

    details: async (id: number): Promise<BannerDto> => {
        const response = await api.get(`/marketing/media/${id}/`);
        const item = response.data;
        // Map backend fields to frontend format
        return {
            id: item.id,
            key: item.key,
            title: item.title,
            subtitle: item.subtitle || null,
            description: item.description || null,
            tag: item.tag || null,
            highlight: typeof item.highlight === "string" ? item.highlight : (item.highlight ? String(item.highlight) : null),
            cta_text: item.cta || item.cta_text || null,
            cta_link: item.link || item.cta_link || null,
            desktop_image: getAbsoluteImageUrl(item.image_desktop || item.image || item.desktop_image),
            mobile_image: getAbsoluteImageUrl(item.image_mobile || item.mobile_image),
            price_text: item.price_text || null,
            old_price_text: item.old_price_text || null,
            is_active: item.is_active ?? true,
            order: item.sort_order ?? item.order ?? item.id,
            position: normalizeBannerPosition(item.position),
            start_at: item.start_at || null,
            end_at: item.end_at || null,
            created_at: item.created_at,
            updated_at: item.updated_at,
        };
    },

    create: async (payload: FormData): Promise<BannerDto> => {
        // Map frontend field names to backend field names
        const backendPayload = new FormData();

        for (const [key, value] of payload.entries()) {
            // Map field names to backend expectations
            if (key === 'subtitle') {
                backendPayload.append('subtitle', value);
            } else if (key === 'description') {
                backendPayload.append('description', value);
            } else if (key === 'desktop_image') {
                backendPayload.append('image_desktop', value);
            } else if (key === 'mobile_image') {
                backendPayload.append('image_mobile', value);
            } else if (key === 'cta') {
                backendPayload.append('cta', value);
            } else if (key === 'sort_order') {
                backendPayload.append('sort_order', value);
            } else if (key === 'position') {
                backendPayload.append('position', normalizeBannerPosition(String(value)));
            } else {
                backendPayload.append(key, value);
            }
        }

        const response = await api.post("/marketing/media/", backendPayload);
        const item = response.data;
        // Map response back to frontend format
        return {
            id: item.id,
            key: item.key,
            title: item.title,
            subtitle: item.subtitle || null,
            description: item.description || null,
            tag: item.tag || null,
            highlight: item.highlight || null,
            cta_text: item.cta || item.cta_text || null,
            cta_link: item.link || item.cta_link || null,
            desktop_image: getAbsoluteImageUrl(item.image_desktop || item.image || item.desktop_image),
            mobile_image: getAbsoluteImageUrl(item.image_mobile || item.mobile_image),
            price_text: item.price_text || null,
            old_price_text: item.old_price_text || null,
            is_active: item.is_active ?? true,
            order: item.sort_order ?? item.order ?? item.id,
            position: normalizeBannerPosition(item.position),
            start_at: item.start_at || null,
            end_at: item.end_at || null,
            created_at: item.created_at,
            updated_at: item.updated_at,
        };
    },

    update: async (id: number, payload: FormData | Partial<BannerDto>): Promise<BannerDto> => {
        let backendPayload: FormData | Partial<BannerDto>;

        if (payload instanceof FormData) {
            // Map frontend field names to backend field names
            backendPayload = new FormData();
            for (const [key, value] of payload.entries()) {
                if (key === 'subtitle') {
                    backendPayload.append('subtitle', value);
                } else if (key === 'description') {
                    backendPayload.append('description', value);
                } else if (key === 'desktop_image') {
                    backendPayload.append('image_desktop', value);
                } else if (key === 'mobile_image') {
                    backendPayload.append('image_mobile', value);
                } else if (key === 'cta') {
                    backendPayload.append('cta', value);
                } else if (key === 'sort_order') {
                    backendPayload.append('sort_order', value);
                } else {
                    backendPayload.append(key, value);
                }
            }
        } else {
            // Map object keys
            backendPayload = {};
            for (const [key, value] of Object.entries(payload)) {
                if (key === 'subtitle') {
                    (backendPayload as any)['subtitle'] = value;
                } else if (key === 'description') {
                    (backendPayload as any)['description'] = value;
                } else if (key === 'desktop_image') {
                    (backendPayload as any)['image_desktop'] = value;
                } else if (key === 'mobile_image') {
                    (backendPayload as any)['image_mobile'] = value;
                } else if (key === 'cta') {
                    (backendPayload as any)['cta'] = value;
                } else if (key === 'sort_order') {
                    (backendPayload as any)['sort_order'] = value;
                } else if (key === 'position') {
                    (backendPayload as any)['position'] = normalizeBannerPosition(String(value));
                } else {
                    (backendPayload as any)[key] = value;
                }
            }
        }

        const response = await api.patch(`/marketing/media/${id}/`, backendPayload);
        const item = response.data;
        // Map response back to frontend format
        return {
            id: item.id,
            key: item.key,
            title: item.title,
            subtitle: item.subtitle || null,
            description: item.description || null,
            tag: item.tag || null,
            highlight: item.highlight || null,
            cta_text: item.cta || item.cta_text || null,
            cta_link: item.link || item.cta_link || null,
            desktop_image: getAbsoluteImageUrl(item.image_desktop || item.image || item.desktop_image),
            mobile_image: getAbsoluteImageUrl(item.image_mobile || item.mobile_image),
            price_text: item.price_text || null,
            old_price_text: item.old_price_text || null,
            is_active: item.is_active ?? true,
            order: item.sort_order ?? item.order ?? item.id,
            position: item.position || 'home_banner',
            start_at: item.start_at || null,
            end_at: item.end_at || null,
            created_at: item.created_at,
            updated_at: item.updated_at,
        };
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/marketing/media/${id}/`);
    },

    reorder: async (orders: { id: number; order: number }[]): Promise<void> => {
        // Map to backend field names
        const backendOrders = orders.map(o => ({ id: o.id, sort_order: o.order }));
        await api.post("/marketing/media/reorder/", { orders: backendOrders });
    },
};
