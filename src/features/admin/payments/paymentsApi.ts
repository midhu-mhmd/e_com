import { api } from "../../../services/api";

/* ── Payment DTO ── 
 * Uses the dedicated /orders/payments/ endpoint for payment management.
 */

export interface PaymentDto {
    payment_id: number;
    order_id: number;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: string;
    payment_method: string;
    payment_method_display: string;
    status: string;
    payment_status_display: string;
    order_status: string;
    transaction_id: string;
    ziina_payment_intent_id: string;
    transaction_date: string;
    updated_date: string;
    provider_response: Record<string, any>;
}

export type PaymentsQuery = {
    search?: string;
    status?: string;
    payment_method?: string;
    order__status?: string;
    page?: number;
    limit?: number;
    offset?: number;
    ordering?: string;
};

export const paymentsApi = {
    /**
     * List all payments with filtering, searching, and pagination.
     */
    list: async (
        params?: PaymentsQuery
    ): Promise<{ results: PaymentDto[]; count: number; next?: string; previous?: string }> => {
        const res = await api.get<{ results: PaymentDto[]; count: number; next?: string; previous?: string }>(
            "/orders/payments/",
            { params }
        );
        return res.data;
    },

    /**
     * Get payment details by payment_id
     */
    details: async (id: number): Promise<PaymentDto> => {
        const res = await api.get<PaymentDto>(`/orders/payments/${id}/`);
        return res.data;
    },
};
