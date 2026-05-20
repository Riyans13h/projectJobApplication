import { api } from "@/services/api";
import type { PageResponse } from "@/types/api";
import type { DashboardStats, Reminder, TimelineEvent } from "@/types/dashboard";

export const dashboardService = {
  stats: async () => {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },
  activity: async (page = 0, size = 10) => {
    const { data } = await api.get<PageResponse<TimelineEvent>>("/dashboard/activity", { params: { page, size } });
    return data;
  },
  reminders: async () => {
    const { data } = await api.get<Reminder[]>("/dashboard/reminders");
    return data;
  },
  deleteActivity: async (id: number) => {
    await api.delete(`/timeline/${id}`);
  },
};
