"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, AuthUser } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (response: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (response) =>
        set({
          token: response.accessToken,
          user: {
            userId: response.userId,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
          },
          isAuthenticated: true,
        }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "jobflow-auth",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
