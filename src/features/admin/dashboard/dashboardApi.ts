
import { api } from "../../../services/api";

import type {
  OrderCounts,
  UsersCount,
  RecentOrder,
  Product,
  DeliveryBoy,
  ContactMsg,
  Review
} from "../../../types/admin";



/* (Returns Full Response) */
export const dashboardApi = {
  fetchOrdersCount: () => api.get<OrderCounts>("/orders/orders_count/"),
  fetchProductsCount: () => api.get("/products/products/products_count/"),
  fetchUsersCount: () => api.get<UsersCount>("/users/users_count/"),
  fetchReviewsCount: () => api.get("/reviews/reviews_count/"),

  _fetchRecentOrders: () => api.get<{ results: RecentOrder[] }>("/orders/?limit=20&ordering=-created_at"),
  _fetchProducts: () => api.get<{ results: Product[] }>("/products/products/?limit=100"),
  _fetchDeliveryBoys: () => api.get<{ results: DeliveryBoy[] }>("/users/delivery_boys/"),
  _fetchSupport: () => api.get<{ results: ContactMsg[] }>("/notifications/contact/?is_resolved=false&limit=5"),
  _fetchReviews: () => api.get<{ results: Review[] }>("/reviews/?limit=20&ordering=-created_at"),
};



/* --- 2. MODERN WRAPPERS (Returns Clean Data) --- */
export const fetchOrderCounts = () => dashboardApi.fetchOrdersCount().then(r => r.data);
export const fetchUsersCount = () => dashboardApi.fetchUsersCount().then(r => r.data);

export const fetchRecentOrders = () => dashboardApi._fetchRecentOrders().then(r => r.data.results);
export const fetchProducts = () => dashboardApi._fetchProducts().then(r => r.data.results);
export const fetchDeliveryBoys = () => dashboardApi._fetchDeliveryBoys().then(r => r.data.results ?? r.data);
export const fetchSupport = () => dashboardApi._fetchSupport().then(r => r.data.results);
export const fetchReviews = () => dashboardApi._fetchReviews().then(r => r.data.results);

