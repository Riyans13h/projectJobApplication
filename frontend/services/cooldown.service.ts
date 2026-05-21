import { applicationService } from "@/services/application.service";
import { api } from "@/services/api";
import type { CompanyCooldown, CompanyCooldownPayload, CooldownTemplate } from "@/types/application";

export const cooldownService = {
  check: applicationService.cooldown,
  create: async (payload: CompanyCooldownPayload) => {
    const { data } = await api.post<CompanyCooldown>("/cooldown", payload);
    return data;
  },
  active: async () => {
    const { data } = await api.get<CompanyCooldown[]>("/cooldown/active");
    return data;
  },
  almostEligible: async () => {
    const { data } = await api.get<CompanyCooldown[]>("/cooldown/almost-eligible");
    return data;
  },
  history: async () => {
    const { data } = await api.get<CompanyCooldown[]>("/cooldown/history");
    return data;
  },
  templates: async () => {
    const { data } = await api.get<CooldownTemplate[]>("/cooldown/templates");
    return data;
  },
  bulkCreate: async (payload: CompanyCooldownPayload[]) => {
    const { data } = await api.post<CompanyCooldown[]>("/cooldown/bulk", payload);
    return data;
  },
  applyAnyway: async ({ id, note }: { id: number; note: string }) => {
    const { data } = await api.patch<CompanyCooldown>(`/cooldown/${id}/apply-anyway`, { note });
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/cooldown/${id}`);
  },
};
