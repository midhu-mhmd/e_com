import { api } from "../../../services/api";

export const dashboardApi = {
  fetchOrdersCount: () => api.get("/orders/orders_count/"),
  fetchProductsCount: () => api.get("/products/products/products_count/"),
  fetchUsersCount: () => api.get("/users/users_count/"),
  fetchReviewsCount: () => api.get("/reviews/reviews_count/"),
};
