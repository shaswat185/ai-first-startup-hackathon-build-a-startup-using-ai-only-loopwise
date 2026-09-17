import { apiClient } from "./apiClient";
import type { BusinessProfile } from "../types";

export type BusinessInput = Omit<BusinessProfile, "id" | "userId" | "createdAt" | "updatedAt">;

export const businessApi = {
  list() {
    return apiClient.get<{ businesses: BusinessProfile[] }>("/businesses").then((r) => r.data.businesses);
  },
  create(data: BusinessInput) {
    return apiClient.post<{ business: BusinessProfile }>("/businesses", data).then((r) => r.data.business);
  },
  get(id: string) {
    return apiClient.get<{ business: BusinessProfile }>(`/businesses/${id}`).then((r) => r.data.business);
  },
  update(id: string, data: Partial<BusinessInput>) {
    return apiClient.put<{ business: BusinessProfile }>(`/businesses/${id}`, data).then((r) => r.data.business);
  },
  remove(id: string) {
    return apiClient.delete<{ message: string }>(`/businesses/${id}`).then((r) => r.data);
  },
};
