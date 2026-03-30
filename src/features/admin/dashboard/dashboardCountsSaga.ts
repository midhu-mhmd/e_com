import { call, put, all, takeLatest } from "redux-saga/effects";
import { dashboardApi } from "./dashboardApi";
import { dashboardCountsActions } from "./dashboardCountsSlice";

function extractCount(data: unknown): number | null {
  if (typeof data === "number" && Number.isFinite(data)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const candidateKeys = [
    "count",
    "total",
    "total_count",
    "totalCount",
    "orders_count",
    "products_count",
    "users_count",
    "reviews_count",
    "total_orders",
    "total_products",
    "total_users",
    "total_reviews",
  ];

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  if (Array.isArray(record.results)) {
    return record.results.length;
  }

  return null;
}

function* fetchDashboardCountsSaga(): Generator<unknown, void, any> {
  try {
    const [ordersRes, productsRes, usersRes, reviewsRes] = yield all([
      call(dashboardApi.fetchOrdersCount),
      call(dashboardApi.fetchProductsCount),
      call(dashboardApi.fetchUsersCount),
      call(dashboardApi.fetchReviewsCount),
    ]);
    yield put(
      dashboardCountsActions.fetchCountsSuccess({
        orders: extractCount(ordersRes.data),
        products: extractCount(productsRes.data),
        users: extractCount(usersRes.data),
        reviews: extractCount(reviewsRes.data),
      })
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch counts";
    yield put(dashboardCountsActions.fetchCountsFailure(message));
  }
}

export function* dashboardCountsSaga() {
  yield takeLatest(dashboardCountsActions.fetchCountsRequest.type, fetchDashboardCountsSaga);
}
