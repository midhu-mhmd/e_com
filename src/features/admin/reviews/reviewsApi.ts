import { api } from "../../../services/api";

/* ── Review DTO from backend ── */
export interface ReviewDto {
    id: number;
    product: number;
    product_name?: string;
    user: number;
    user_name?: string;
    rating: number;
    comment: string;
    images?: Array<{ id: number; image: string; created_at: string }>;
    admin_response?: string | null;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

export type ReviewsQuery = {
    q?: string;
    rating?: number;
    is_visible?: boolean;
    product?: number;
    user?: number;
    page?: number;
    limit?: number;
    offset?: number;
};

export const reviewsApi = {
    list: async (
        params?: ReviewsQuery
    ): Promise<{ results: ReviewDto[]; count: number }> => {
        const { page: _page, ...requestParams } = params ?? {};
        const res = await api.get<{ results: ReviewDto[]; count: number }>(
            "/reviews/",
            { params: requestParams }
        );
        return res.data;
    },

    details: async (id: number): Promise<ReviewDto> => {
        const res = await api.get<ReviewDto>(`/reviews/${id}/`);
        return res.data;
    },

    approve: async (id: number): Promise<ReviewDto> => {
        const res = await api.patch<ReviewDto>(`/reviews/${id}/`, {
            is_approved: true,
        });
        return res.data;
    },

    reject: async (id: number): Promise<ReviewDto> => {
        const res = await api.patch<ReviewDto>(`/reviews/${id}/`, {
            is_approved: false,
        });
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/reviews/${id}/`);
    },

    create: async (data: {
        product: number;
        rating: number;
        comment: string;
        uploaded_images?: File[];
    }): Promise<ReviewDto> => {
        const form = new FormData();
        form.append("product", String(data.product));
        form.append("rating", String(data.rating));
        form.append("comment", data.comment?.trim?.() ?? data.comment);
        if (data.uploaded_images && data.uploaded_images.length > 0) {
            for (const file of data.uploaded_images) {
                form.append("uploaded_images", file);
            }
        }
        const res = await api.post<ReviewDto>("/reviews/", form, { suppressGlobal5xx: true } as any);
        return res.data;
    },
    
    update: async (id: number, data: {
        rating?: number;
        comment?: string;
        uploaded_images?: File[];
    }): Promise<ReviewDto> => {
        const form = new FormData();
        if (typeof data.rating === "number") form.append("rating", String(data.rating));
        if (typeof data.comment === "string") form.append("comment", data.comment);
        if (data.uploaded_images && data.uploaded_images.length > 0) {
            for (const file of data.uploaded_images) {
                form.append("uploaded_images", file);
            }
        }
        const res = await api.patch<ReviewDto>(`/reviews/${id}/`, form, { suppressGlobal5xx: true } as any);
        return res.data;
    },
    
    toggleVisibility: async (id: number): Promise<{ message: string; is_visible?: boolean }> => {
        const res = await api.post<{ message: string; is_visible?: boolean }>(`/reviews/${id}/toggle_visibility/`);
        return res.data;
    },
    
    setAdminResponse: async (id: number, admin_response: string): Promise<ReviewDto> => {
        const form = new FormData();
        form.append("admin_response", admin_response ?? "");
        const res = await api.patch<ReviewDto>(`/reviews/${id}/`, form, { suppressGlobal5xx: true } as any);
        return res.data;
    },
};
