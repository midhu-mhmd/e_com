import { api } from "../../../services/api";

export interface ContactMessageDto {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  is_active: boolean;
  created_at: string;
}

export type ContactQuery = {
  q?: string;
  is_resolved?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
};

export const supportApi = {
  list: async (
    params?: ContactQuery
  ): Promise<{ results: ContactMessageDto[]; count: number }> => {
    const res = await api.get<{ results: ContactMessageDto[]; count: number }>(
      "/notifications/contact/",
      { params }
    );
    return res.data;
  },

  resolve: async (id: number, is_resolved: boolean): Promise<ContactMessageDto> => {
    const res = await api.patch<ContactMessageDto>(`/notifications/contact/${id}/`, { is_resolved });
    return res.data;
  },

  toggleActive: async (id: number, is_active: boolean): Promise<ContactMessageDto> => {
    const res = await api.patch<ContactMessageDto>(`/notifications/contact/${id}/`, { is_active });
    return res.data;
  },

  reply: async (
    id: number,
    data: { reply_message: string; mark_resolved?: boolean }
  ): Promise<{ detail: string }> => {
    const res = await api.post<{ detail: string }>(`/notifications/contact/${id}/reply/`, data);
    return res.data;
  },
};
