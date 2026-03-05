import { api } from "../../../services/api";

/* ── Delivery Tier DTO ── */
export interface DeliveryTierDto {
  id?: number;
  product: number;
  min_quantity: number;
  delivery_days: number;
}

/* ── Discount Tier DTO ── */
export interface DiscountTierDto {
  id?: number;
  product: number;
  min_quantity: number;
  discount_percentage: number;
}

/* ── Tier Management API ── */
export const tierApi = {
  /* ── Delivery Tiers ── */
  deliveryTiers: {
    list: async (
      productId?: number
    ): Promise<{ results: DeliveryTierDto[]; count: number }> => {
      const res = await api.get<{ results: DeliveryTierDto[]; count: number }>(
        "/products/delivery-tiers/",
        { params: { ...(productId && { product: productId }) } }
      );
      return res.data;
    },

    create: async (payload: DeliveryTierDto): Promise<DeliveryTierDto> => {
      const res = await api.post<DeliveryTierDto>(
        "/products/delivery-tiers/",
        payload
      );
      return res.data;
    },

    update: async (
      id: number,
      payload: Partial<DeliveryTierDto>
    ): Promise<DeliveryTierDto> => {
      const res = await api.patch<DeliveryTierDto>(
        `/products/delivery-tiers/${id}/`,
        payload
      );
      return res.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/products/delivery-tiers/${id}/`);
    },
  },

  /* ── Discount Tiers ── */
  discountTiers: {
    list: async (
      productId?: number
    ): Promise<{ results: DiscountTierDto[]; count: number }> => {
      const res = await api.get<{ results: DiscountTierDto[]; count: number }>(
        "/products/discount-tiers/",
        { params: { ...(productId && { product: productId }) } }
      );
      return res.data;
    },

    create: async (payload: DiscountTierDto): Promise<DiscountTierDto> => {
      const res = await api.post<DiscountTierDto>(
        "/products/discount-tiers/",
        payload
      );
      return res.data;
    },

    update: async (
      id: number,
      payload: Partial<DiscountTierDto>
    ): Promise<DiscountTierDto> => {
      const res = await api.patch<DiscountTierDto>(
        `/products/discount-tiers/${id}/`,
        payload
      );
      return res.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/products/discount-tiers/${id}/`);
    },
  },
};
