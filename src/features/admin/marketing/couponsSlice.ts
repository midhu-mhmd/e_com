import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CouponDto, CouponStatsDto, RewardConfigDto } from "./couponsApi";

export interface Coupon extends CouponDto {
    // Add any frontend-specific fields here if needed
}

export interface CouponsState {
    coupons: Coupon[];
    stats: CouponStatsDto | null;
    rewardConfig: RewardConfigDto | null;
    selectedCouponId: number | null;
    loading: boolean;
    error: string | null;
    totalCount: number;
}

const initialState: CouponsState = {
    coupons: [],
    stats: null,
    rewardConfig: null,
    selectedCouponId: null,
    loading: false,
    error: null,
    totalCount: 0,
};

export const couponsSlice = createSlice({
    name: "coupons",
    initialState,
    reducers: {
        fetchCouponsRequest(state, _action: PayloadAction<any>) {
            state.loading = true;
            state.error = null;
        },
        fetchCouponsSuccess(state, action: PayloadAction<{ results: CouponDto[]; count: number }>) {
            state.loading = false;
            state.coupons = action.payload.results;
            state.totalCount = action.payload.count;
        },
        fetchCouponsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Statistics
        fetchCouponStatsRequest(state) {
            state.loading = true;
        },
        fetchCouponStatsSuccess(state, action: PayloadAction<CouponStatsDto>) {
            state.loading = false;
            state.stats = action.payload;
        },
        fetchCouponStatsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Reward Config
        fetchRewardConfigRequest(state) {
            state.loading = true;
        },
        fetchRewardConfigSuccess(state, action: PayloadAction<RewardConfigDto>) {
            state.loading = false;
            state.rewardConfig = action.payload;
        },
        fetchRewardConfigFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        updateRewardConfigRequest(state, _action: PayloadAction<Partial<RewardConfigDto>>) {
            state.loading = true;
        },
        updateRewardConfigSuccess(state, action: PayloadAction<RewardConfigDto>) {
            state.loading = false;
            state.rewardConfig = action.payload;
        },
        updateRewardConfigFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        resetRewardDefaultsRequest(state) {
            state.loading = true;
        },

        // Coupon CRUD
        createCouponRequest(state, _action: PayloadAction<Partial<CouponDto>>) {
            state.loading = true;
            state.error = null;
        },
        createCouponSuccess(state, action: PayloadAction<CouponDto>) {
            state.loading = false;
            state.coupons.unshift(action.payload);
            state.totalCount++;
        },
        createCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        updateCouponRequest(state, _action: PayloadAction<{ id: number; payload: Partial<CouponDto> }>) {
            state.loading = true;
            state.error = null;
        },
        updateCouponSuccess(state, action: PayloadAction<CouponDto>) {
            state.loading = false;
            const index = state.coupons.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.coupons[index] = action.payload;
            }
        },
        updateCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Soft Delete / Restore
        softDeleteCouponRequest(state, _action: PayloadAction<number>) {
            state.loading = true;
        },
        softDeleteCouponSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            const coupon = state.coupons.find(c => c.id === action.payload);
            if (coupon) {
                coupon.deleted_at = new Date().toISOString();
            }
        },
        softDeleteCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        restoreCouponRequest(state, _action: PayloadAction<number>) {
            state.loading = true;
        },
        restoreCouponSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            const coupon = state.coupons.find(c => c.id === action.payload);
            if (coupon) {
                coupon.deleted_at = null;
            }
        },
        restoreCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Hard Delete (Original delete)
        deleteCouponRequest(state, _action: PayloadAction<number>) {
            state.loading = true;
            state.error = null;
        },
        deleteCouponSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            state.coupons = state.coupons.filter((c) => c.id !== action.payload);
            state.totalCount--;
        },
        deleteCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        setSelectedCouponId(state, action: PayloadAction<number | null>) {
            state.selectedCouponId = action.payload;
        },
    },
});

export const {
    fetchCouponsRequest,
    fetchCouponsSuccess,
    fetchCouponsFailure,
    fetchCouponStatsRequest,
    fetchCouponStatsSuccess,
    fetchCouponStatsFailure,
    fetchRewardConfigRequest,
    fetchRewardConfigSuccess,
    fetchRewardConfigFailure,
    updateRewardConfigRequest,
    updateRewardConfigSuccess,
    updateRewardConfigFailure,
    resetRewardDefaultsRequest,
    createCouponRequest,
    createCouponSuccess,
    createCouponFailure,
    updateCouponRequest,
    updateCouponSuccess,
    updateCouponFailure,
    softDeleteCouponRequest,
    softDeleteCouponSuccess,
    softDeleteCouponFailure,
    restoreCouponRequest,
    restoreCouponSuccess,
    restoreCouponFailure,
    deleteCouponRequest,
    deleteCouponSuccess,
    deleteCouponFailure,
    setSelectedCouponId,
} = couponsSlice.actions;

export const selectCoupons = (state: any) => state.coupons.coupons;
export const selectCouponStats = (state: any) => state.coupons.stats;
export const selectRewardConfig = (state: any) => state.coupons.rewardConfig;
export const selectSelectedCoupon = (state: any) =>
    state.coupons.coupons.find((c: Coupon) => c.id === state.coupons.selectedCouponId);
export const selectCouponsLoading = (state: any) => state.coupons.loading;
export const selectCouponsError = (state: any) => state.coupons.error;
export const selectCouponsTotal = (state: any) => state.coupons.totalCount;

export default couponsSlice.reducer;
