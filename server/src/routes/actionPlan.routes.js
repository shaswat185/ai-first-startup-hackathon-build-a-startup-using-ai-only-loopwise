import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getActionPlan,
  updateTaskCompletion,
  updateTaskNotes,
} from "../controllers/actionPlan.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/:diagnosisId", getActionPlan);
router.patch("/:diagnosisId/tasks/:taskId", updateTaskCompletion);
router.patch("/:diagnosisId/tasks/:taskId/notes", updateTaskNotes);

export default router;
