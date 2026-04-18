export interface OrderCounts {
  total_orders: number;
  processing: number;
  shipped: number;
  delivered: number;
  pending?: number;
  paid?: number;
  cancelled?: number;
  total_revenue: string;
}

export interface UsersCount {
  total_users: number;
  active_users?: number;
}

export interface RecentOrder {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  items: { product_name: string; quantity: number }[];
  payment: { status: string; payment_method: string } | null;
  delivery_assignment: { delivery_boy_name: string } | null;
  shipping_address_details: { full_name: string; emirate: string } | null;
}

export interface Product {
  id: number;
  name: string;
  stock: number;
  final_price: string;
  image: string | null;
  category_name: string;
}

export interface DeliveryBoy {
  id: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
  delivery_profile: { is_available: boolean; assigned_emirates: string[] } | null;
}

export interface ContactMsg {
  id: number;
  name: string;
  subject: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  product_name: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
