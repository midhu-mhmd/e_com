import { api } from "../../services/api";

/* ── Delivery Boy Profile ── */
export interface DeliveryProfile {
  is_available: boolean;
  assigned_emirates: string[];
  assigned_emirates_display: string[];
  vehicle_number: string | null;
  identity_number: string | null;
  emergency_contact: string | null;
  notes: string | null;
}

/* ── Delivery Assignment ── */
export interface DeliveryAssignment {
  id: number;
  delivery_boy: number;
  delivery_boy_name: string;
  status: "ASSIGNED" | "IN_TRANSIT" | "COMPLETED";
  assigned_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}

/* ── Delivery Proof ── */
export interface DeliveryProof {
  proof_image: string;
  signature_name: string | null;
  notes: string | null;
  uploaded_by: number;
  created_at: string;
}

/* ── Cancellation Request ── */
export interface CancellationRequest {
  id: number;
  order: number;
  requested_by: number;
  requested_by_name: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  review_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
}

/* ── Delivery Order (simplified) ── */
export interface DeliveryOrder {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  shipping_address_details: {
    full_name: string;
    phone_number: string;
    street_address: string;
    area: string;
    city: string;
    emirate: string;
    country: string;
    latitude: string | null;
    longitude: string | null;
  };
  items: Array<{
    id: number;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: string;
  }>;
  delivery_assignment: DeliveryAssignment | null;
  delivery_proof: DeliveryProof | null;
  cancellation_request: CancellationRequest | null;
}

/* ── Dashboard delivery boy summary ── */
export interface DeliveryBoyInfo {
  id: number;
  name: string;
  is_available: boolean;
  assigned_emirates: string[];
  assigned_emirates_display: string[];
}

/* ── Dashboard KPI ── */
export interface DeliveryDashboardData {
  delivery_boy: DeliveryBoyInfo;
  kpis: {
    assigned_orders: number;
    completed_today: number;
    pending_assigned_orders: number;
    available_orders_in_region: number;
    completed_total: number;
  };
  recent_assigned_orders: DeliveryOrder[];
}

/* ── Delivery Boy User (admin list) ── */
export interface DeliveryBoyUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  delivery_profile: DeliveryProfile | null;
}

// ─────────────────────────────────────────
// Delivery Boy Endpoints
// ─────────────────────────────────────────

export const deliveryApi = {
  /** GET /orders/delivery_dashboard/ */
  getDashboard: async (): Promise<DeliveryDashboardData> => {
    const res = await api.get<DeliveryDashboardData>("/orders/delivery_dashboard/");
    return res.data;
  },

  /** GET /orders/available_orders/ */
  getAvailableOrders: async (): Promise<DeliveryOrder[]> => {
    const res = await api.get<DeliveryOrder[]>("/orders/available_orders/");
    return res.data;
  },

  /** GET /orders/ (delivery boy sees their assigned orders) */
  getMyOrders: async (): Promise<{ results: DeliveryOrder[]; count: number }> => {
    const res = await api.get<{ results: DeliveryOrder[]; count: number }>("/orders/");
    return res.data;
  },

  /** GET /orders/:id/ */
  getOrder: async (orderId: number): Promise<DeliveryOrder> => {
    const res = await api.get<DeliveryOrder>(`/orders/${orderId}/`);
    return res.data;
  },

  /** POST /orders/:id/claim_order/ */
  claimOrder: async (orderId: number, notes?: string): Promise<{ message: string; order_id: number; assignment_id: number }> => {
    const res = await api.post(`/orders/${orderId}/claim_order/`, notes ? { notes } : {});
    return res.data;
  },

  /** POST /orders/:id/delivery_update_status/ — JSON variant (SHIPPED / cancel) */
  updateStatus: async (
    orderId: number,
    payload: { status: string; notes?: string; reason?: string }
  ): Promise<void> => {
    await api.post(`/orders/${orderId}/delivery_update_status/`, payload);
  },

  /** POST /orders/:id/delivery_update_status/ — FormData variant (DELIVERED with proof) */
  submitProof: async (
    orderId: number,
    formData: FormData
  ): Promise<void> => {
    await api.post(`/orders/${orderId}/delivery_update_status/`, formData);
  },

  // ─────────────────────────────────────────
  // Admin Delivery Endpoints
  // ─────────────────────────────────────────

  /** POST /users/users/create_delivery_boy/ */
  adminCreateDeliveryBoy: async (payload: {
    email?: string;
    phone_number?: string;
    first_name: string;
    last_name: string;
    assigned_emirates?: string[];
    vehicle_number?: string;
    identity_number?: string;
    emergency_contact?: string;
    notes?: string;
    is_available?: boolean;
  }): Promise<DeliveryBoyUser> => {
    const res = await api.post<DeliveryBoyUser>("/users/create_delivery_boy/", payload);
    return res.data;
  },

  /** GET /users/{id}/delivery_boy_detail/ */
  adminGetDeliveryBoyDetail: async (id: number): Promise<DeliveryBoyUser> => {
    const res = await api.get<DeliveryBoyUser>(`/users/${id}/delivery_boy_detail/`);
    return res.data;
  },

  /** PATCH /users/{id}/update_delivery_boy/ */
  adminUpdateDeliveryBoy: async (id: number, payload: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    is_active?: boolean;
    assigned_emirates?: string[];
    vehicle_number?: string;
    identity_number?: string;
    emergency_contact?: string;
    notes?: string;
    is_available?: boolean;
  }): Promise<DeliveryBoyUser> => {
    const res = await api.patch<DeliveryBoyUser>(`/users/${id}/update_delivery_boy/`, payload);
    return res.data;
  },

  /** GET /users/delivery_boys/ */
  adminListDeliveryBoys: async (params?: { limit?: number; offset?: number; search?: string }): Promise<{ results: DeliveryBoyUser[]; count: number }> => {
    const res = await api.get<{ results: DeliveryBoyUser[]; count: number }>("/users/delivery_boys/", { params });
    return res.data;
  },

  /** POST /orders/:id/admin_assign_delivery_boy/ */
  adminAssignDeliveryBoy: async (
    orderId: number,
    deliveryBoyId: number,
    notes?: string
  ): Promise<void> => {
    await api.post(`/orders/${orderId}/admin_assign_delivery_boy/`, {
      delivery_boy_id: deliveryBoyId,
      ...(notes ? { notes } : {}),
    });
  },

  /** POST /orders/:id/admin_review_cancel_request/ */
  adminReviewCancelRequest: async (
    orderId: number,
    decision: "approve" | "reject",
    reviewNotes?: string
  ): Promise<void> => {
    await api.post(`/orders/${orderId}/admin_review_cancel_request/`, {
      decision,
      ...(reviewNotes ? { review_notes: reviewNotes } : {}),
    });
  },

  /** POST /users/users/:id/set_role/ */
  adminSetRole: async (userId: number, role: string): Promise<void> => {
    await api.post(`/users/${userId}/set_role/`, { role });
  },
};
