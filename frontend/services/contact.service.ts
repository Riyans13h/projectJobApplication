import { api } from "@/services/api";
import type { PageResponse } from "@/types/api";
import type { Contact, ContactListParams, ContactPayload } from "@/types/contact";

export const contactService = {
  list: async (params: ContactListParams = {}) => {
    const { page = 0, size = 10, company, contactType, status, helpScore, sortBy = "createdAt", sortDir = "desc" } = params;
    const hasFilters = Boolean(company || contactType || status || helpScore);
    const endpoint = hasFilters ? "/contacts/filter" : "/contacts";
    const { data } = await api.get<PageResponse<Contact>>(endpoint, {
      params: {
        page,
        size,
        company: company || undefined,
        contactType: contactType || undefined,
        status: status || undefined,
        helpScore: helpScore || undefined,
        sortBy,
        sortDir,
      },
    });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Contact>(`/contacts/${id}`);
    return data;
  },
  create: async (payload: ContactPayload) => {
    const { data } = await api.post<Contact>("/contacts", payload);
    return data;
  },
  update: async (id: number, payload: ContactPayload) => {
    const { data } = await api.put<Contact>(`/contacts/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/contacts/${id}`);
  },
};
