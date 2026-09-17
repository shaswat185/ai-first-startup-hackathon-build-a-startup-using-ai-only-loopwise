import { apiClient } from "./apiClient";
import type { DashboardStats } from "../types";

export const dashboardApi = {
  getStats() {
    return apiClient.get<DashboardStats>("/dashboard/stats").then((r) => r.data);
  },
};
