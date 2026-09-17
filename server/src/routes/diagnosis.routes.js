import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createDiagnosis,
  listDiagnoses,
  getDiagnosis,
  submitFollowUp,
  deleteDiagnosis,
} from "../controllers/diagnosis.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createDiagnosis);
router.get("/", listDiagnoses);
router.get("/:id", getDiagnosis);
router.post("/:id/follow-up", submitFollowUp);
router.delete("/:id", deleteDiagnosis);

export default router;
