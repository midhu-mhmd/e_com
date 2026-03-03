import { api } from "../../../services/api";

export interface AdminNotificationDto {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const adminNotificationApi = {
    list: async (): Promise<AdminNotificationDto[]> => {
        const response = await api.get<{ results: AdminNotificationDto[] }>("/notifications/");
        // Depending on backend pagination, it might be an array or an object with results
        return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },

    markAsRead: async (id: number): Promise<void> => {
        await api.post(`/notifications/${id}/mark_as_read/`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post("/notifications/mark_all_as_read/");
    },
};
