import { api } from "../../../services/api";

export interface CouponDto {
    id: number;
    code: string;
    description: string;
    discount_type: "percentage" | "fixed";
    discount_value: string;
    min_order_amount: string;
    max_discount_amount: string | null;
    valid_from: string;
    valid_to: string | null;
    is_active: boolean;
    usage_limit: number | null;
    used_count: number;
    assigned_user: number | null;
    assigned_user_email: string | null;
    assigned_user_id: number | null;
    is_referral_reward: boolean;
    is_first_order_reward: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CouponStatsDto {
    total_coupons: number;
    active_coupons: number;
    referral_coupons: number;
    first_order_coupons: number;
    total_redeemed: number;
}

export interface RewardConfigDto {
    first_order_discount_type: "percentage" | "fixed";
    first_order_discount_value: string;
    first_order_min_amount: string;
    first_order_validity_days: number;
    referral_discount_type: "percentage" | "fixed";
    referral_discount_value: string;
    referral_min_amount: string;
    referral_validity_days: number;
    referral_usage_limit: number;
    referrer_discount_value: string;
    referrer_validity_days: number;
    max_discount_percentage: string | null;
    is_referral_active: boolean;
    is_first_order_active: boolean;
    updated_by?: number;
    updated_by_email?: string;
    updated_at?: string;
}

export type CouponsQuery = {
    search?: string;
    is_active?: boolean;
    discount_type?: "percentage" | "fixed";
    assigned_user?: number;
    is_referral_reward?: boolean;
    is_first_order_reward?: boolean;
    valid_from?: string;
    valid_to?: string;
    ordering?: string;
    page?: number;
    limit?: number;
    offset?: number;
};

const BASE_URL = "/marketing/admin/coupons/";
const REWARDS_URL = "/marketing/admin/rewards/";

export const couponsApi = {
    list: async (
        params?: CouponsQuery
    ): Promise<{ results: CouponDto[]; count: number }> => {
        const { page: _page, ...requestParams } = params ?? {};
        const res = await api.get<{ results: CouponDto[]; count: number }>(
            BASE_URL,
            { params: requestParams }
        );
        return res.data;
    },

    details: async (id: number): Promise<CouponDto> => {
        const res = await api.get<CouponDto>(`${BASE_URL}${id}/`);
        return res.data;
    },

    create: async (payload: Partial<CouponDto>): Promise<CouponDto> => {
        const res = await api.post<CouponDto>(BASE_URL, payload);
        return res.data;
    },

    update: async (id: number, payload: Partial<CouponDto>): Promise<CouponDto> => {
        const res = await api.patch<CouponDto>(`${BASE_URL}${id}/`, payload);
        return res.data;
    },

    softDelete: async (id: number): Promise<{ detail: string }> => {
        const res = await api.post<{ detail: string }>(`${BASE_URL}${id}/soft_delete/`);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${BASE_URL}${id}/`);
    },

    restore: async (id: number): Promise<{ detail: string }> => {
        const res = await api.post<{ detail: string }>(`${BASE_URL}${id}/restore/`);
        return res.data;
    },

    stats: async (): Promise<CouponStatsDto> => {
        const res = await api.get<CouponStatsDto>(`${BASE_URL}stats/`);
        return res.data;
    },

    // Reward Configuration Endpoints
    getRewardConfig: async (): Promise<RewardConfigDto> => {
        const res = await api.get<RewardConfigDto>(REWARDS_URL);
        return res.data;
    },

    updateRewardConfig: async (payload: Partial<RewardConfigDto>): Promise<{ detail: string; config: RewardConfigDto }> => {
        const res = await api.patch<{ detail: string; config: RewardConfigDto }>(REWARDS_URL, payload);
        return res.data;
    },

    resetRewardDefaults: async (): Promise<{ detail: string; config: RewardConfigDto }> => {
        const res = await api.post<{ detail: string; config: RewardConfigDto }>(`${REWARDS_URL}reset_to_defaults/`);
        return res.data;
    },
};
