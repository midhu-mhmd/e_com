import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import type { Customer, CustomersQuery } from "./customersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CustomersState {
  items: Customer[];
  totalCount: number;
  currentPage: number;
  status: Status;
  error: string | null;
  selectedId: string | null;
  lastQuery: CustomersQuery | null;

  /* ── Show deleted toggle ── */
  showDeleted: boolean;

  /* ── Individual action feedback ── */
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  actionError: string | null;
}

const initialState: CustomersState = {
  items: [],
  totalCount: 0,
  currentPage: 1,
  status: "idle",
  error: null,
  selectedId: null,
  lastQuery: null,
  showDeleted: false,
  actionStatus: "idle",
  actionError: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    /* ── Fetch ── */
    fetchCustomersRequest: (state, action: PayloadAction<CustomersQuery | undefined>) => {
      state.status = "loading";
      state.error = null;
      state.lastQuery = action.payload ?? null;
    },
    fetchCustomersSuccess: (
      state,
      action: PayloadAction<{ items: Customer[]; totalCount: number; page: number }>
    ) => {
      state.status = "succeeded";
      state.items = action.payload.items;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.page;
    },
    fetchCustomersFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    setSelectedCustomerId: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    /* ── Show deleted toggle ── */
    toggleShowDeleted: (state) => {
      state.showDeleted = !state.showDeleted;
    },

    /* ── Generic action lifecycle (block, unblock, delete, restore, set-role) ── */
    actionRequest: (state, _action: PayloadAction<{ type: string; id: string; payload?: any }>) => {
      state.actionStatus = "loading";
      state.actionError = null;
    },
    actionSuccess: (state, _action: PayloadAction<string>) => {
      state.actionStatus = "succeeded";
      state.actionError = null;
    },
    actionFailure: (state, action: PayloadAction<string>) => {
      state.actionStatus = "failed";
      state.actionError = action.payload;
    },
    actionReset: (state) => {
      state.actionStatus = "idle";
      state.actionError = null;
    },
  },
});

export const customersActions = customersSlice.actions;
export default customersSlice.reducer;

// selectors
export const selectCustomers = (s: RootState) => s.customers.items;
export const selectCustomersTotal = (s: RootState) => s.customers.totalCount;
export const selectCustomersPage = (s: RootState) => s.customers.currentPage;
export const selectCustomersStatus = (s: RootState) => s.customers.status;
export const selectCustomersError = (s: RootState) => s.customers.error;
export const selectSelectedCustomerId = (s: RootState) => s.customers.selectedId;
export const selectShowDeleted = (s: RootState) => s.customers.showDeleted;
export const selectActionStatus = (s: RootState) => s.customers.actionStatus;
export const selectActionError = (s: RootState) => s.customers.actionError;
