import { apiClient } from "./apiClient";
import type { AuthResponse, User } from "../types";

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return apiClient.post<AuthResponse>("/auth/register", data).then((r) => r.data);
  },
  login(data: { email: string; password: string }) {
    return apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data);
  },
  me() {
    return apiClient.get<{ user: User }>("/auth/me").then((r) => r.data.user);
  },
  logout() {
    return apiClient.post<{ message: string }>("/auth/logout").then((r) => r.data);
  },
};
