import { Business } from "../models/Business.js";
import { Diagnosis } from "../models/Diagnosis.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeProgressPercent } from "../utils/progress.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const [totalBusinesses, diagnoses] = await Promise.all([
    Business.countDocuments({ userId }),
    Diagnosis.find({ userId }).populate("businessId", "name").sort({ createdAt: -1 }),
  ]);

  const totalDiagnoses = diagnoses.length;

  let completedTasks = 0;
  let activeActionPlans = 0;
  let progressSum = 0;
  let plansWithProgress = 0;

  for (const d of diagnoses) {
    const completed = d.actionPlan.filter((t) => t.completed).length;
    completedTasks += completed;

    if (d.actionPlan.length > 0) {
      const progress = computeProgressPercent(d.actionPlan);
      progressSum += progress;
      plansWithProgress += 1;
      if (progress < 100) activeActionPlans += 1;
    }
  }

  const averageProgressPercent = plansWithProgress > 0 ? Math.round(progressSum / plansWithProgress) : 0;

  const recentDiagnoses = diagnoses.slice(0, 5).map((d) => ({
    id: d._id.toString(),
    businessName: d.businessId?.name || "Unknown business",
    problem: d.problem,
    createdAt: d.createdAt,
    status: d.status,
    progressPercent: computeProgressPercent(d.actionPlan),
  }));

  res.json({
    totalBusinesses,
    totalDiagnoses,
    activeActionPlans,
    completedTasks,
    averageProgressPercent,
    recentDiagnoses,
  });
});
