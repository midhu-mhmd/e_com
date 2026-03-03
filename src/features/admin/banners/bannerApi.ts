import api from "../../../services/api";

export interface BannerDto {
    id: number;
    title: string;
    subtitle?: string | null;
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
    created_at?: string;
    updated_at?: string;
}

export const bannerApi = {
    list: async (): Promise<BannerDto[]> => {
        const response = await api.get<{ results: any[] }>("/marketing/media/");
        const results = response.data.results || [];
        // Map common fields if they differ from current UI expectations
        return results.map((item: any) => ({
            ...item,
            // Fallbacks for the UI structure if using the minimal API structure
            desktop_image: item.image || item.desktop_image,
            cta_link: item.link || item.cta_link,
            is_active: item.is_active ?? true,
            order: item.order ?? item.id
        }));
    },

    details: async (id: number): Promise<BannerDto> => {
        const response = await api.get(`/marketing/media/${id}/`);
        return response.data;
    },

    create: async (payload: FormData): Promise<BannerDto> => {
        const response = await api.post("/marketing/media/", payload);
        return response.data;
    },

    update: async (id: number, payload: FormData | Partial<BannerDto>): Promise<BannerDto> => {
        const response = await api.patch(`/marketing/media/${id}/`, payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/marketing/media/${id}/`);
    },

    reorder: async (orders: { id: number; order: number }[]): Promise<void> => {
        await api.post("/marketing/media/reorder/", { orders });
    },
};
