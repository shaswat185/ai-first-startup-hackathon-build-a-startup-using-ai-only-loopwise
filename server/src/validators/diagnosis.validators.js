import { z } from "zod";

export const diagnosisCreateSchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  problem: z.string().trim().min(5, "Please describe the problem in more detail").max(1000),
  problemDuration: z.string().trim().min(1, "Please indicate when the problem started").max(200),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  recentChanges: z.string().trim().max(1000).optional().or(z.literal("")),
  previousAttempts: z.string().trim().max(1000).optional().or(z.literal("")),
  desiredOutcome: z.string().trim().max(500).optional().or(z.literal("")),
  additionalContext: z.string().trim().max(2000).optional().or(z.literal("")),
  currentMetrics: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const followUpAnswerSchema = z.object({
  answers: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().trim().max(1000),
      })
    )
    .min(1, "At least one answer is required"),
});

export const taskNotesSchema = z.object({
  notes: z.string().trim().max(1000),
});

export const taskCompleteSchema = z.object({
  completed: z.boolean(),
});
