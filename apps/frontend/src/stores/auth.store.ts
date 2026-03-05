import { storage } from "@/utils/storage";
import { create } from "zustand";
import { authService, type AuthUser } from "../services/auth.service";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await storage.getItem("auth_token");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await authService.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await storage.deleteItem("auth_token");
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
