import { api } from "@/services/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authService = {
  login: async (payload: LoginRequest) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterRequest) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
};
