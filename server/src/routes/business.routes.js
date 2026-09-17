import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} from "../controllers/business.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listBusinesses);
router.post("/", createBusiness);
router.get("/:id", getBusiness);
router.put("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;
