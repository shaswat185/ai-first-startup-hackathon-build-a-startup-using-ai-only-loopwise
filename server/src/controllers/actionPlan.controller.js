import mongoose from "mongoose";
import { Diagnosis } from "../models/Diagnosis.js";
import { taskNotesSchema, taskCompleteSchema } from "../validators/diagnosis.validators.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeProgressPercent } from "../utils/progress.js";

async function findOwnedDiagnosis(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid diagnosis id", [], "INVALID_ID");
  }
  const diagnosis = await Diagnosis.findOne({ _id: id, userId });
  if (!diagnosis) {
    throw ApiError.notFound("Diagnosis not found", "DIAGNOSIS_NOT_FOUND");
  }
  return diagnosis;
}

function findTaskOrThrow(diagnosis, taskId) {
  const task = diagnosis.actionPlan.find((t) => t.id === taskId);
  if (!task) {
    throw ApiError.notFound("Task not found", "TASK_NOT_FOUND");
  }
  return task;
}

function syncDiagnosisStatus(diagnosis) {
  const progress = computeProgressPercent(diagnosis.actionPlan);
  if (progress === 100) {
    diagnosis.status = "completed";
  } else if (progress > 0) {
    diagnosis.status = "in_progress";
  } else if (diagnosis.status === "completed") {
    diagnosis.status = "diagnosed";
  }
}

export const getActionPlan = asyncHandler(async (req, res) => {
  const diagnosis = await findOwnedDiagnosis(req.params.diagnosisId, req.userId);
  res.json({
    diagnosisId: diagnosis._id.toString(),
    status: diagnosis.status,
    progressPercent: computeProgressPercent(diagnosis.actionPlan),
    actionPlan: diagnosis.actionPlan,
  });
});

export const updateTaskCompletion = asyncHandler(async (req, res) => {
  const parsed = taskCompleteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid task update", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }

  const diagnosis = await findOwnedDiagnosis(req.params.diagnosisId, req.userId);
  const task = findTaskOrThrow(diagnosis, req.params.taskId);

  task.completed = parsed.data.completed;
  task.completedAt = parsed.data.completed ? new Date() : null;

  syncDiagnosisStatus(diagnosis);
  await diagnosis.save();

  res.json({
    task,
    progressPercent: computeProgressPercent(diagnosis.actionPlan),
    status: diagnosis.status,
  });
});

export const updateTaskNotes = asyncHandler(async (req, res) => {
  const parsed = taskNotesSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid notes", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }

  const diagnosis = await findOwnedDiagnosis(req.params.diagnosisId, req.userId);
  const task = findTaskOrThrow(diagnosis, req.params.taskId);

  task.notes = parsed.data.notes;
  await diagnosis.save();

  res.json({ task });
});
