import { z } from "zod";

const priorityEnum = z.enum(["Low", "Medium", "High"]);

/**
 * Models occasionally return cost fields as strings ("500", "₹500", "1,200")
 * instead of plain numbers, even when explicitly instructed otherwise.
 * This coerces any numeric-looking string into a real number while still
 * rejecting genuinely invalid values (e.g. "unknown", "TBD").
 */
const costSchema = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const match = val.match(/\d[\d,]*(\.\d+)?/);
    if (!match) {
      // No digits found at all (e.g. "Free", "No cost", "Included") - treat as zero cost
      // rather than failing the whole diagnosis over a formatting quirk.
      return 0;
    }
    const cleaned = match[0].replace(/,/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }
  return val;
}, z.number({ invalid_type_error: "Cost must be a number" }).min(0));

/**
 * Models sometimes send the action-plan "day" as a string ("1") instead of
 * a number, the same way they occasionally do for costs. Coerce any
 * numeric-looking string into a real integer before validating the range.
 */
const daySchema = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const match = val.match(/\d+/);
    if (!match) return val;
    const num = Number(match[0]);
    return Number.isNaN(num) ? val : num;
  }
  return val;
}, z.number({ invalid_type_error: "Day must be a number" }).int().min(1).max(7));

const possibleCauseSchema = z.object({
  cause: z.string().min(1),
  reason: z.string().min(1),
  evidenceNeeded: z.string().min(1),
});

const recommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  whyItFits: z.string().min(1),
  estimatedCost: costSchema,
  priority: priorityEnum,
});

const followUpQuestionSchema = z.object({
  question: z.string().min(1),
  reason: z.string().min(1),
});

const actionPlanTaskSchema = z.object({
  id: z.string().min(1),
  day: daySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  priority: priorityEnum,
  estimatedCost: costSchema,
  expectedOutput: z.string().min(1),
  completed: z.boolean().default(false),
});

/**
 * Full shape expected from the AI provider. This is intentionally strict:
 * if the model returns malformed JSON, a missing field, a wrong type,
 * or fewer/more than 7 action-plan tasks, validation fails and the
 * caller must surface a real error - never fall back to fake data.
 */
export const diagnosisResponseSchema = z.object({
  summary: z.string().min(1),
  confidence: z.enum(["Low", "Medium", "High"]).default("Medium"),
  possibleCauses: z.array(possibleCauseSchema).min(1),
  recommendations: z.array(recommendationSchema).min(1),
  followUpQuestions: z.array(followUpQuestionSchema).default([]),
  dataLimitations: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  actionPlan: z.array(actionPlanTaskSchema).length(7, "Action plan must contain exactly 7 tasks"),
});