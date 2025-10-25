import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { StreetChatMessage } from "../models/StreetChatMessage.js";
import { StreetMembership } from "../models/StreetMembership.js";

const router = Router();

router.get("/streets/:streetGroupId/chat", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const { streetGroupId } = req.params;
  const { cursor, limit = "20" } = req.query;
  const parsedLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const membership = await StreetMembership.findOne({
    userId: req.user!._id,
    streetGroupId,
  }).sort({ joinedAt: -1 });

  if (!membership || membership.leftAt) {
    return res.status(403).json({ message: "Join the street to view chat" });
  }

  const query: Record<string, unknown> = {
    streetGroupId,
    createdAt: { $gte: membership.joinedAt },
  };

  if (cursor && typeof cursor === "string") {
    query._id = { $lt: cursor };
  }

  const messages = await StreetChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(parsedLimit + 1);

  const nextCursor = messages.length > parsedLimit ? messages[parsedLimit - 1]?._id : null;

  res.json({ messages: messages.slice(0, parsedLimit).reverse(), nextCursor });
});

const chatSchema = z.object({ text: z.string().min(1) });

router.post("/streets/:streetGroupId/chat", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Message required" });
  }

  const { streetGroupId } = req.params;

  const membership = await StreetMembership.findOne({ userId: req.user!._id, streetGroupId, leftAt: null }).sort({ joinedAt: -1 });
  if (!membership) {
    return res.status(403).json({ message: "Join the street to chat" });
  }

  const message = await StreetChatMessage.create({
    streetGroupId,
    senderId: req.user!._id,
    text: parsed.data.text,
  });

  res.status(201).json(message);
});

export default router;
