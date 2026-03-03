import { api } from "../../../services/api";

/* ── User DTO from backend ── */
export interface UserDto {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  role: "user" | "admin" | "staff";
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  google_id: string | null;
  profile: {
    id: number;
    profile_picture: string | null;
    date_of_birth: string | null;
    gender: string | null;
    preferred_language: string;
    newsletter_subscribed: boolean;
    notification_enabled: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  addresses: AddressDto[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  last_login_at: string | null;
}

/* ── Address DTO ── */
export interface AddressDto {
  id: number;
  label: string;
  full_name: string;
  phone_number: string;
  building_name: string;
  flat_villa_number: string;
  street_address: string;
  area: string;
  city: string;
  emirate: string;
  country: string;
  is_default: boolean;
}

/* ── Frontend Customer type ── */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "staff";
  status: "Active" | "Blocked";
  isDeleted: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  googleLinked: boolean;
  profilePicture: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  preferredLanguage: string;
  newsletterSubscribed: boolean;
  notificationEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  addresses: AddressDto[];
}

export type CustomersQuery = {
  q?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
  offset?: number;
};

export const customersApi = {
  /** GET /users/ — active users */
  list: async (params?: CustomersQuery): Promise<{ results: UserDto[]; count: number }> => {
    const res = await api.get<{ results: UserDto[]; count: number }>("/users/", { params });
    return res.data;
  },

  /** GET /users/all/ — all users including soft-deleted */
  listAll: async (params?: CustomersQuery): Promise<{ results: UserDto[]; count: number }> => {
    const res = await api.get<{ results: UserDto[]; count: number }>("/users/all/", { params });
    return res.data;
  },

  /** GET /users/:id/ */
  details: async (id: string): Promise<UserDto> => {
    const res = await api.get<UserDto>(`/users/${id}/`);
    return res.data;
  },

  /** DELETE /users/:id/ — soft delete */
  softDelete: async (id: string) => {
    const res = await api.delete(`/users/${id}/`);
    return res.data;
  },

  /** POST /users/:id/restore/ — restore soft-deleted user */
  restore: async (id: string) => {
    const res = await api.post(`/users/${id}/restore/`);
    return res.data;
  },

  /** POST /users/:id/set-role/ */
  setRole: async (id: string, role: string) => {
    const res = await api.post(`/users/${id}/set-role/`, { role });
    return res.data;
  },

  /** PATCH /users/:id/ — block user (is_active: false) */
  blockUser: async (id: string) => {
    const res = await api.patch(`/users/${id}/`, { is_active: false });
    return res.data;
  },

  /** PATCH /users/:id/ — unblock user (is_active: true) */
  unblockUser: async (id: string) => {
    const res = await api.patch(`/users/${id}/`, { is_active: true });
    return res.data;
  },

  /** GET /addresses/ */
  listAddresses: async (): Promise<AddressDto[] | { results: AddressDto[] }> => {
    const res = await api.get<AddressDto[] | { results: AddressDto[] }>("/addresses/");
    return res.data;
  },

  /** POST /addresses/ */
  createAddress: async (data: Omit<AddressDto, "id" | "is_default">) => {
    const res = await api.post("/addresses/", data);
    return res.data;
  },

  /** POST /addresses/:id/set-default/ */
  setDefaultAddress: async (id: number) => {
    const res = await api.post(`/addresses/${id}/set-default/`);
    return res.data;
  },
};
