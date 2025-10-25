import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";

const router = Router();

const postSchema = z.object({
  category: z.enum(["FOR_SALE", "FREE", "SERVICES", "LOST_FOUND", "ANNOUNCEMENT", "EVENT"]),
  title: z.string().min(3),
  body: z.string().min(3),
  visibility: z.enum(["STREET", "STREET_AND_TOWN"]).default("STREET"),
  images: z.array(z.string().url()).optional(),
});

router.post("/posts", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid post", errors: parsed.error.flatten() });
  }

  const user = req.user!;
  if (!user.streetGroupId || !user.townId) {
    return res.status(400).json({ message: "Join your street before posting" });
  }

  const post = await Post.create({
    ...parsed.data,
    authorId: user._id,
    streetGroupId: user.streetGroupId,
    townId: user.townId,
    images: parsed.data.images || [],
  });

  res.status(201).json(post);
});

router.get("/posts", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { scope = "street", category, cursor } = req.query;
  const limit = 10;

  const query: Record<string, unknown> = { status: "ACTIVE" };

  if (scope === "town" && req.user?.townId) {
    query.townId = req.user.townId;
  } else if (req.user?.streetGroupId) {
    query.streetGroupId = req.user.streetGroupId;
  }

  if (category && typeof category === "string") {
    query.category = category;
  }

  if (cursor && typeof cursor === "string") {
    query._id = { $lt: cursor };
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const nextCursor = posts.length > limit ? posts[limit - 1]?._id : null;
  const results = posts.slice(0, limit);

  res.json({ posts: results, nextCursor });
});

router.get("/posts/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(post);
});

router.patch("/posts/:id", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.authorId.toString() !== req.user!.id) {
    return res.status(403).json({ message: "You can only edit your own posts" });
  }

  const parsed = postSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid post" });
  }

  Object.assign(post, parsed.data);
  await post.save();

  res.json(post);
});

router.delete("/posts/:id", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.authorId.toString() !== req.user!.id && !req.user?.isAdmin) {
    return res.status(403).json({ message: "Not authorised" });
  }

  post.status = "DELETED";
  await post.save();

  res.json({ message: "Post deleted" });
});

router.get("/posts/:id/comments", requireAuth, async (req, res) => {
  const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 });
  res.json({ comments });
});

const commentSchema = z.object({ body: z.string().min(1) });

router.post("/posts/:id/comments", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid comment" });
  }

  const comment = await Comment.create({
    postId: req.params.id,
    authorId: req.user!._id,
    body: parsed.data.body,
  });

  res.status(201).json(comment);
});

export default router;
