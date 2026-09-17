import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health
router.get("/", (req, res) => {
  const dbStateMap = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStateMap[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

export default router;
