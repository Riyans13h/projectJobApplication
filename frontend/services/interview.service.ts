import { api } from "@/services/api";
import type { PageResponse } from "@/types/api";
import type { Interview, InterviewPayload, InterviewResult } from "@/types/interview";

export const interviewService = {
  listForApplication: async (applicationId: number, page = 0, size = 20) => {
    const { data } = await api.get<PageResponse<Interview>>(`/applications/${applicationId}/interviews`, {
      params: { page, size, sortBy: "interviewDate", sortDir: "desc" },
    });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Interview>(`/interviews/${id}`);
    return data;
  },
  create: async (applicationId: number, payload: InterviewPayload) => {
    const { data } = await api.post<Interview>(`/applications/${applicationId}/interviews`, payload);
    return data;
  },
  update: async (id: number, payload: InterviewPayload) => {
    const { data } = await api.put<Interview>(`/interviews/${id}`, payload);
    return data;
  },
  updateResult: async (id: number, result: InterviewResult) => {
    const { data } = await api.patch<Interview>(`/interviews/${id}/result`, null, { params: { result } });
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/interviews/${id}`);
  },
};
