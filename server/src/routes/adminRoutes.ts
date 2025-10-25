import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { Post } from "../models/Post.js";
import { Address } from "../models/Address.js";
import { AddressResident } from "../models/AddressResident.js";
import { StreetGroup } from "../models/StreetGroup.js";
import { Town } from "../models/Town.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/admin/stats", async (_req, res) => {
  const [users, verifiedUsers, posts, openReports, streets, towns] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerifiedAt: { $ne: null } }),
    Post.countDocuments({ status: "ACTIVE" }),
    Report.countDocuments({ status: "OPEN" }),
    StreetGroup.countDocuments(),
    Town.countDocuments(),
  ]);

  res.json({ users, verifiedUsers, posts, openReports, streets, towns });
});

router.get("/admin/users", async (req, res) => {
  const { q, isAdmin, page = "1" } = req.query;
  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const PAGE_SIZE = 20;
  const query: Record<string, unknown> = {};
  if (q && typeof q === "string") {
    query.$or = [{ email: { $regex: q, $options: "i" } }, { firstName: { $regex: q, $options: "i" } }];
  }
  if (typeof isAdmin === "string") {
    query.isAdmin = isAdmin === "true";
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    User.countDocuments(query),
  ]);

  res.json({ users: items, total, page: pageNum });
});

router.patch("/admin/users/:id/toggle-admin", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isAdmin) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "At least one admin is required" });
    }
  }

  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json({ message: "Admin status updated", isAdmin: user.isAdmin });
});

router.get("/admin/reports", async (_req, res) => {
  const reports = await Report.find({ status: "OPEN" }).sort({ createdAt: -1 });
  res.json({ reports });
});

router.post("/admin/reports/:id/action", async (req, res) => {
  const { action } = z.object({ action: z.enum(["ACTIONED", "DISMISSED"]) }).parse(req.body);
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.status = action;
  await report.save();

  res.json({ message: "Report updated" });
});

router.get("/admin/addresses", async (req, res) => {
  const { postcode } = req.query;
  if (!postcode || typeof postcode !== "string") {
    return res.status(400).json({ message: "postcode query required" });
  }

  const addresses = await Address.find({ postcode: postcode.toUpperCase() });
  const residents = await AddressResident.find({ addressId: { $in: addresses.map((a) => a._id) } });

  res.json({ addresses, residents });
});

router.post("/admin/addresses/:id/transfer-owner", async (req, res) => {
  const { newOwnerId } = z.object({ newOwnerId: z.string() }).parse(req.body);
  const address = await Address.findById(req.params.id);
  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  await AddressResident.updateMany({ addressId: address._id, role: "OWNER", state: "ACTIVE" }, { role: "RESIDENT" });
  const newOwner = await AddressResident.findOne({ addressId: address._id, userId: newOwnerId, state: "ACTIVE" });
  if (!newOwner) {
    return res.status(400).json({ message: "New owner must be active" });
  }
  newOwner.role = "OWNER";
  await newOwner.save();

  await Address.findByIdAndUpdate(address._id, { ownerUserId: newOwnerId });
  await User.findByIdAndUpdate(newOwnerId, { addressRole: "OWNER" });

  res.json({ message: "Owner updated" });
});

export default router;
