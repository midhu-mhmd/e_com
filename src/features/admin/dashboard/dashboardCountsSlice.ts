import { createSlice } from "@reduxjs/toolkit";

interface DashboardCountsState {
  orders: number | null;
  products: number | null;
  users: number | null;
  reviews: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardCountsState = {
  orders: null,
  products: null,
  users: null,
  reviews: null,
  loading: false,
  error: null,
};

const dashboardCountsSlice = createSlice({
  name: "dashboardCounts",
  initialState,
  reducers: {
    fetchCountsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCountsSuccess(state, action) {
      state.loading = false;
      state.orders = action.payload.orders ?? null;
      state.products = action.payload.products ?? null;
      state.users = action.payload.users ?? null;
      state.reviews = action.payload.reviews ?? null;
    },
    fetchCountsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const dashboardCountsActions = dashboardCountsSlice.actions;
export default dashboardCountsSlice.reducer;
