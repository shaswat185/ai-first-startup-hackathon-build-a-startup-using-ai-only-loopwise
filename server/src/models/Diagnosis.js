import mongoose from "mongoose";

const possibleCauseSchema = new mongoose.Schema(
  {
    cause: { type: String, required: true },
    reason: { type: String, required: true },
    evidenceNeeded: { type: String, required: true },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    whyItFits: { type: String, required: true },
    estimatedCost: { type: Number, required: true, min: 0 },
    priority: { type: String, required: true, enum: ["Low", "Medium", "High"] },
  },
  { _id: false }
);

const followUpQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    reason: { type: String, required: true },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const actionPlanTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    day: { type: Number, required: true, min: 1, max: 7 },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true, enum: ["Low", "Medium", "High"] },
    estimatedCost: { type: Number, required: true, min: 0 },
    expectedOutput: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const diagnosisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },

    // Problem submission inputs
    problem: { type: String, required: true, trim: true, maxlength: 1000 },
    problemDuration: { type: String, required: true, trim: true, maxlength: 200 },
    severity: { type: String, required: true, enum: ["Low", "Medium", "High", "Critical"] },
    recentChanges: { type: String, trim: true, maxlength: 1000, default: "" },
    previousAttempts: { type: String, trim: true, maxlength: 1000, default: "" },
    desiredOutcome: { type: String, trim: true, maxlength: 500, default: "" },
    additionalContext: { type: String, trim: true, maxlength: 2000, default: "" },
    currentMetrics: { type: String, trim: true, maxlength: 1000, default: "" },

    // Accumulated follow-up answers (question -> answer), used to enrich re-diagnosis
    answers: { type: Map, of: String, default: {} },

    // AI output
    summary: { type: String, default: "" },
    confidence: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    possibleCauses: { type: [possibleCauseSchema], default: [] },
    recommendations: { type: [recommendationSchema], default: [] },
    followUpQuestions: { type: [followUpQuestionSchema], default: [] },
    dataLimitations: { type: [String], default: [] },
    assumptions: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    actionPlan: { type: [actionPlanTaskSchema], default: [] },

    status: {
      type: String,
      enum: ["draft", "diagnosed", "in_progress", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

diagnosisSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId?.toString();
    ret.businessId = ret.businessId?.toString();
    ret.answers = ret.answers instanceof Map ? Object.fromEntries(ret.answers) : ret.answers || {};
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);
