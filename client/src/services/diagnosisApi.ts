import { apiClient } from "./apiClient";
import type { ActionPlanTask, Diagnosis, DiagnosisHistoryItem } from "../types";

export interface DiagnosisInput {
  businessId: string;
  problem: string;
  problemDuration: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  recentChanges?: string;
  previousAttempts?: string;
  desiredOutcome?: string;
  additionalContext?: string;
  currentMetrics?: string;
}

export const diagnosisApi = {
  create(data: DiagnosisInput) {
    return apiClient.post<{ diagnosis: Diagnosis }>("/diagnoses", data).then((r) => r.data.diagnosis);
  },
  list() {
    return apiClient.get<{ diagnoses: DiagnosisHistoryItem[] }>("/diagnoses").then((r) => r.data.diagnoses);
  },
  get(id: string) {
    return apiClient.get<{ diagnosis: Diagnosis }>(`/diagnoses/${id}`).then((r) => r.data.diagnosis);
  },
  submitFollowUp(id: string, answers: { question: string; answer: string }[]) {
    return apiClient
      .post<{ diagnosis: Diagnosis }>(`/diagnoses/${id}/follow-up`, { answers })
      .then((r) => r.data.diagnosis);
  },
  remove(id: string) {
    return apiClient.delete<{ message: string }>(`/diagnoses/${id}`).then((r) => r.data);
  },
};

export const actionPlanApi = {
  get(diagnosisId: string) {
    return apiClient
      .get<{ diagnosisId: string; status: string; progressPercent: number; actionPlan: ActionPlanTask[] }>(
        `/action-plans/${diagnosisId}`
      )
      .then((r) => r.data);
  },
  toggleTask(diagnosisId: string, taskId: string, completed: boolean) {
    return apiClient
      .patch<{ task: ActionPlanTask; progressPercent: number; status: string }>(
        `/action-plans/${diagnosisId}/tasks/${taskId}`,
        { completed }
      )
      .then((r) => r.data);
  },
  updateNotes(diagnosisId: string, taskId: string, notes: string) {
    return apiClient
      .patch<{ task: ActionPlanTask }>(`/action-plans/${diagnosisId}/tasks/${taskId}/notes`, { notes })
      .then((r) => r.data.task);
  },
};
