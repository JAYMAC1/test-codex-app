import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { buildConversationHash } from "../utils/conversation.js";
import { Types } from "mongoose";

const router = Router();

router.post("/conversations", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const { otherUserId } = z.object({ otherUserId: z.string() }).parse(req.body);
  const userId = new Types.ObjectId(req.user!.id);
  const otherId = new Types.ObjectId(otherUserId);

  const memberHash = buildConversationHash(userId, otherId);
  let conversation = await Conversation.findOne({ memberHash });
  if (!conversation) {
    conversation = await Conversation.create({ memberIds: [userId, otherId], memberHash });
  }

  res.json(conversation);
});

router.get("/conversations", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const conversations = await Conversation.find({ memberIds: req.user!._id }).sort({ lastMessageAt: -1 });
  res.json({ conversations });
});

router.get("/conversations/:id/messages", requireAuth, requireVerified, async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
  res.json({ messages });
});

const messageSchema = z.object({ body: z.string().min(1) });

router.post("/conversations/:id/messages", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid message" });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !conversation.memberIds.some((id) => id.toString() === req.user!.id)) {
    return res.status(403).json({ message: "Not part of this conversation" });
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user!._id,
    body: parsed.data.body,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(201).json(message);
});

export default router;
