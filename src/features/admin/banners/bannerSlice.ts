import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { bannerApi, type BannerDto } from "./bannerApi";

interface BannerState {
    items: BannerDto[];
    loading: boolean;
    error: string | null;
}

const initialState: BannerState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchBanners = createAsyncThunk("banners/fetchAll", async () => {
    return await bannerApi.list();
});

export const addBanner = createAsyncThunk("banners/add", async (payload: FormData) => {
    return await bannerApi.create(payload);
});

export const updateBanner = createAsyncThunk(
    "banners/update",
    async ({ id, payload }: { id: number; payload: FormData | Partial<BannerDto> }) => {
        return await bannerApi.update(id, payload);
    }
);

export const deleteBanner = createAsyncThunk("banners/delete", async (id: number) => {
    await bannerApi.delete(id);
    return id;
});

const bannerSlice = createSlice({
    name: "banners",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<BannerDto[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch banners";
            })
            // Add
            .addCase(addBanner.fulfilled, (state, action: PayloadAction<BannerDto>) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateBanner.fulfilled, (state, action: PayloadAction<BannerDto>) => {
                const index = state.items.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter((b) => b.id !== action.payload);
            });
    },
});

export default bannerSlice.reducer;
export const selectBanners = (state: { banners: BannerState }) => state.banners.items;
export const selectBannersLoading = (state: { banners: BannerState }) => state.banners.loading;
export const selectBannersError = (state: { banners: BannerState }) => state.banners.error;
