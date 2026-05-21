import { api } from "@/services/api";
import type {
  Application,
  ApplicationListParams,
  ApplicationPayload,
  ApplicationStats,
  CooldownInfo,
  FileUploadResponse,
  Interview,
  TimelineEntry,
} from "@/types/application";
import type { PageResponse } from "@/types/api";

export const applicationService = {
  list: async (params: ApplicationListParams = {}) => {
    const { page = 0, size = 10, company, status, priority } = params;
    const hasFilters = Boolean(company || status || priority);
    const endpoint = hasFilters ? "/applications/filter" : "/applications";
    const { data } = await api.get<PageResponse<Application>>(endpoint, {
      params: {
        page,
        size,
        company: company || undefined,
        status: status || undefined,
        priority: priority || undefined,
      },
    });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Application>(`/applications/${id}`);
    return data;
  },
  create: async (payload: ApplicationPayload) => {
    const { data } = await api.post<Application>("/applications", payload);
    return data;
  },
  update: async (id: number, payload: ApplicationPayload) => {
    const { data } = await api.put<Application>(`/applications/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/applications/${id}`);
  },
  stats: async () => {
    const { data } = await api.get<ApplicationStats>("/applications/stats");
    return data;
  },
  uploadResume: async (file: File, company: string, jobId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<FileUploadResponse>("/files/resume", formData, {
      params: { company, jobId },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  uploadJd: async (file: File, company?: string, jobId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<FileUploadResponse>("/files/jd", formData, {
      params: { company: company || undefined, jobId: jobId || undefined },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  uploadCoverLetter: async (file: File, company?: string, jobId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<FileUploadResponse>("/files/cover-letter", formData, {
      params: { company: company || undefined, jobId: jobId || undefined },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  files: async (company: string, jobId: string) => {
    const { data } = await api.get<FileUploadResponse[]>("/files", {
      params: { company, jobId },
    });
    return data;
  },
  interviews: async (applicationId: number) => {
    const { data } = await api.get<PageResponse<Interview>>(`/applications/${applicationId}/interviews`, {
      params: { page: 0, size: 10, sortBy: "interviewDate", sortDir: "desc" },
    });
    return data;
  },
  timeline: async (applicationId: number) => {
    const { data } = await api.get<PageResponse<TimelineEntry>>(`/applications/${applicationId}/timeline`, {
      params: { page: 0, size: 10 },
    });
    return data;
  },
  cooldown: async (company: string, role?: string) => {
    const { data } = await api.get<CooldownInfo>("/cooldown/check", { params: { company, role: role || undefined } });
    return data;
  },
};
