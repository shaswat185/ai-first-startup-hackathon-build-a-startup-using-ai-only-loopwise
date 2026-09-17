import mongoose from "mongoose";
import { Diagnosis } from "../models/Diagnosis.js";
import { Business } from "../models/Business.js";
import {
  diagnosisCreateSchema,
  followUpAnswerSchema,
} from "../validators/diagnosis.validators.js";
import { generateDiagnosis } from "../services/groq.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeProgressPercent } from "../utils/progress.js";

function assertValidId(id, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${label}`, [], "INVALID_ID");
  }
}

async function findOwnedDiagnosis(id, userId) {
  assertValidId(id, "diagnosis id");
  const diagnosis = await Diagnosis.findOne({ _id: id, userId });
  if (!diagnosis) {
    throw ApiError.notFound("Diagnosis not found", "DIAGNOSIS_NOT_FOUND");
  }
  return diagnosis;
}

function toHistoryItem(diagnosis, businessName) {
  return {
    id: diagnosis._id.toString(),
    businessName,
    problem: diagnosis.problem,
    createdAt: diagnosis.createdAt,
    status: diagnosis.status,
    progressPercent: computeProgressPercent(diagnosis.actionPlan),
  };
}

export const createDiagnosis = asyncHandler(async (req, res) => {
  const parsed = diagnosisCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      "Invalid diagnosis submission",
      parsed.error.issues.map((i) => i.message),
      "VALIDATION_ERROR"
    );
  }
  const input = parsed.data;
  assertValidId(input.businessId, "business id");

  const business = await Business.findOne({ _id: input.businessId, userId: req.userId });
  if (!business) {
    throw ApiError.notFound("Business not found", "BUSINESS_NOT_FOUND");
  }

  const aiResult = await generateDiagnosis({
    business: business.toJSON(),
    diagnosisInput: input,
  });

  const diagnosis = await Diagnosis.create({
    userId: req.userId,
    businessId: business._id,
    problem: input.problem,
    problemDuration: input.problemDuration,
    severity: input.severity,
    recentChanges: input.recentChanges || "",
    previousAttempts: input.previousAttempts || "",
    desiredOutcome: input.desiredOutcome || "",
    additionalContext: input.additionalContext || "",
    currentMetrics: input.currentMetrics || "",
    answers: {},
    summary: aiResult.summary,
    confidence: aiResult.confidence,
    possibleCauses: aiResult.possibleCauses,
    recommendations: aiResult.recommendations,
    followUpQuestions: aiResult.followUpQuestions.map((q) => ({ ...q, answer: "" })),
    dataLimitations: aiResult.dataLimitations,
    assumptions: aiResult.assumptions,
    risks: aiResult.risks,
    actionPlan: aiResult.actionPlan,
    status: "diagnosed",
  });

  res.status(201).json({ diagnosis: { ...diagnosis.toJSON(), businessName: business.name } });
});

export const listDiagnoses = asyncHandler(async (req, res) => {
  const diagnoses = await Diagnosis.find({ userId: req.userId })
    .populate("businessId", "name")
    .sort({ createdAt: -1 });

  const items = diagnoses.map((d) => toHistoryItem(d, d.businessId?.name || "Unknown business"));
  res.json({ diagnoses: items });
});

export const getDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await findOwnedDiagnosis(req.params.id, req.userId);
  const business = await Business.findById(diagnosis.businessId);

  res.json({
    diagnosis: {
      ...diagnosis.toJSON(),
      businessName: business?.name || "Unknown business",
    },
  });
});

export const submitFollowUp = asyncHandler(async (req, res) => {
  const parsed = followUpAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      "Invalid follow-up answers",
      parsed.error.issues.map((i) => i.message),
      "VALIDATION_ERROR"
    );
  }

  const diagnosis = await findOwnedDiagnosis(req.params.id, req.userId);
  const business = await Business.findOne({ _id: diagnosis.businessId, userId: req.userId });
  if (!business) {
    throw ApiError.notFound("Business not found", "BUSINESS_NOT_FOUND");
  }

  const { answers } = parsed.data;

  const aiResult = await generateDiagnosis({
    business: business.toJSON(),
    diagnosisInput: {
      problem: diagnosis.problem,
      problemDuration: diagnosis.problemDuration,
      severity: diagnosis.severity,
      recentChanges: diagnosis.recentChanges,
      previousAttempts: diagnosis.previousAttempts,
      desiredOutcome: diagnosis.desiredOutcome,
      additionalContext: diagnosis.additionalContext,
      currentMetrics: diagnosis.currentMetrics,
    },
    previousDiagnosis: diagnosis.toJSON(),
    followUpAnswers: answers,
  });

  // Merge new answers into the accumulated answers map
  for (const a of answers) {
    diagnosis.answers.set(a.question, a.answer);
  }

  diagnosis.summary = aiResult.summary;
  diagnosis.confidence = aiResult.confidence;
  diagnosis.possibleCauses = aiResult.possibleCauses;
  diagnosis.recommendations = aiResult.recommendations;
  diagnosis.followUpQuestions = aiResult.followUpQuestions.map((q) => ({ ...q, answer: "" }));
  diagnosis.dataLimitations = aiResult.dataLimitations;
  diagnosis.assumptions = aiResult.assumptions;
  diagnosis.risks = aiResult.risks;

  // Preserve completion state for tasks that still match by id; otherwise adopt the refined plan.
  const previousById = new Map(diagnosis.actionPlan.map((t) => [t.id, t]));
  diagnosis.actionPlan = aiResult.actionPlan.map((t) => {
    const prev = previousById.get(t.id);
    return prev ? { ...t, completed: prev.completed, completedAt: prev.completedAt, notes: prev.notes } : t;
  });

  await diagnosis.save();

  res.json({ diagnosis: { ...diagnosis.toJSON(), businessName: business.name } });
});

export const deleteDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await findOwnedDiagnosis(req.params.id, req.userId);
  await diagnosis.deleteOne();
  res.json({ message: "Diagnosis deleted" });
});
