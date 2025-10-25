import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { Report } from "../models/Report.js";

const router = Router();

const reportSchema = z.object({
  targetType: z.enum(["POST", "COMMENT", "USER"]),
  targetId: z.string(),
  reason: z.string().min(5),
});

router.post("/reports", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid report" });
  }

  const report = await Report.create({
    ...parsed.data,
    reporterId: req.user!._id,
  });

  res.status(201).json(report);
});

export default router;
