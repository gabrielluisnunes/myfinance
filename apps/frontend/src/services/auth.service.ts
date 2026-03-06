import { storage } from "@/utils/storage";
import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>(
      "/auth/login",
      payload,
    );
    await storage.setItem("auth_token", data.data.token);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>(
      "/auth/register",
      payload,
    );
    await storage.setItem("auth_token", data.data.token);
    return data.data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<{ data: AuthUser }>("/users/me");
    return data.data;
  },

  async logout(): Promise<void> {
    await storage.deleteItem("auth_token");
  },
};
