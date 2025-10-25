import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { Address } from "../models/Address.js";
import { AddressResident } from "../models/AddressResident.js";
import { StreetGroup } from "../models/StreetGroup.js";
import { Town } from "../models/Town.js";
import { StreetMembership } from "../models/StreetMembership.js";
import { Types } from "mongoose";
import { User } from "../models/User.js";

const router = Router();

const joinSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  postcode: z.string().min(5),
  town: z.string().min(2),
  streetName: z.string().min(2),
});

router.post("/addresses/join", requireAuth, requireVerified, async (req: AuthenticatedRequest, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid address", errors: parsed.error.flatten() });
  }

  const { line1, line2, postcode, town, streetName } = parsed.data;
  const user = req.user!;

  const townDoc = await Town.findOneAndUpdate(
    { name: town },
    { name: town },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const streetDoc = await StreetGroup.findOneAndUpdate(
    { townId: townDoc._id, name: streetName },
    { townId: townDoc._id, name: streetName },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let address = await Address.findOne({ postcode: postcode.toUpperCase(), line1 });
  if (!address) {
    address = await Address.create({
      line1,
      line2,
      postcode: postcode.toUpperCase(),
      town,
      ownerUserId: user._id,
      residentCount: 1,
    });

    await AddressResident.create({
      userId: user._id,
      addressId: address._id,
      role: "OWNER",
      state: "ACTIVE",
      approvedAt: new Date(),
    });

    user.addressId = address._id;
    user.addressRole = "OWNER";
    user.streetGroupId = streetDoc._id;
    user.townId = townDoc._id;
    await user.save();

    await StreetMembership.create({ userId: user._id, streetGroupId: streetDoc._id });
    await StreetGroup.findByIdAndUpdate(streetDoc._id, { $inc: { memberCount: 1 } });
    await Town.findByIdAndUpdate(townDoc._id, { $inc: { memberCount: 1 } });

    return res.status(201).json({
      status: "OWNER",
      message: "You are now the owner of this address",
      addressId: address._id,
    });
  }

  const activeOwner = await AddressResident.findOne({ addressId: address._id, role: "OWNER", state: "ACTIVE" });

  if (!activeOwner) {
    await Address.findByIdAndUpdate(address._id, { ownerUserId: user._id });
    await AddressResident.create({
      userId: user._id,
      addressId: address._id,
      role: "OWNER",
      state: "ACTIVE",
      approvedAt: new Date(),
    });
  } else {
    const existingRequest = await AddressResident.findOne({
      userId: user._id,
      addressId: address._id,
      state: { $in: ["PENDING", "ACTIVE"] },
    });
    if (existingRequest) {
      return res.json({ status: existingRequest.state, message: "Request already submitted" });
    }
    await AddressResident.create({
      userId: user._id,
      addressId: address._id,
      role: "RESIDENT",
      state: "PENDING",
    });

    return res.status(202).json({ status: "PENDING", message: "Waiting for owner approval" });
  }

  await Address.findByIdAndUpdate(address._id, { $inc: { residentCount: 1 } });
  await StreetMembership.create({ userId: user._id, streetGroupId: streetDoc._id });
  await StreetGroup.findByIdAndUpdate(streetDoc._id, { $inc: { memberCount: 1 } });
  await Town.findByIdAndUpdate(townDoc._id, { $inc: { memberCount: 1 } });

  user.addressId = address._id;
  user.addressRole = "OWNER";
  user.streetGroupId = streetDoc._id;
  user.townId = townDoc._id;
  await user.save();

  res.json({ status: "OWNER", message: "Ownership confirmed", addressId: address._id });
});

async function ensureOwnerOrAdmin(userId: Types.ObjectId, addressId: Types.ObjectId) {
  const resident = await AddressResident.findOne({
    userId,
    addressId,
    state: "ACTIVE",
  });
  if (!resident) return null;
  return resident.role;
}

router.post(
  "/addresses/:id/requests/:requestId/approve",
  requireAuth,
  requireVerified,
  async (req: AuthenticatedRequest, res) => {
    const addressId = req.params.id;
    const requestId = req.params.requestId;
    const user = req.user!;

    if (!user.isAdmin) {
      const role = await ensureOwnerOrAdmin(user._id, new Types.ObjectId(addressId));
      if (role !== "OWNER") {
        return res.status(403).json({ message: "Only owners or admins can approve" });
      }
    }

    const request = await AddressResident.findById(requestId);
    if (!request || request.addressId.toString() !== addressId) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.state !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.state = "ACTIVE";
    request.approvedAt = new Date();
    await request.save();

    await Address.findByIdAndUpdate(addressId, { $inc: { residentCount: 1 } });

    await StreetMembership.create({ userId: request.userId, streetGroupId: user.streetGroupId });

    await User.findByIdAndUpdate(request.userId, {
      addressId,
      addressRole: request.role,
      streetGroupId: user.streetGroupId,
      townId: user.townId,
    });

    res.json({ message: "Resident approved" });
  }
);

router.post(
  "/addresses/:id/requests/:requestId/deny",
  requireAuth,
  requireVerified,
  async (req: AuthenticatedRequest, res) => {
    const addressId = req.params.id;
    const requestId = req.params.requestId;
    const user = req.user!;

    if (!user.isAdmin) {
      const role = await ensureOwnerOrAdmin(user._id, new Types.ObjectId(addressId));
      if (role !== "OWNER") {
        return res.status(403).json({ message: "Only owners or admins can deny" });
      }
    }

    const request = await AddressResident.findById(requestId);
    if (!request || request.addressId.toString() !== addressId) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.state !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.state = "REMOVED";
    request.removedAt = new Date();
    await request.save();

    res.json({ message: "Request denied" });
  }
);

router.post(
  "/addresses/:id/residents/:userId/remove",
  requireAuth,
  requireVerified,
  async (req: AuthenticatedRequest, res) => {
    const addressId = req.params.id;
    const residentUserId = req.params.userId;
    const user = req.user!;

    if (!user.isAdmin && user.id !== residentUserId) {
      const role = await ensureOwnerOrAdmin(user._id, new Types.ObjectId(addressId));
      if (role !== "OWNER") {
        return res.status(403).json({ message: "Only owners or admins can remove residents" });
      }
    }

    const resident = await AddressResident.findOne({ addressId, userId: residentUserId, state: "ACTIVE" });
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const targetUser = await User.findById(residentUserId);

    resident.state = "REMOVED";
    resident.removedAt = new Date();
    await resident.save();

    await Address.findByIdAndUpdate(addressId, { $inc: { residentCount: -1 } });
    if (targetUser?.streetGroupId) {
      await StreetMembership.updateMany(
        { userId: residentUserId, streetGroupId: targetUser.streetGroupId, leftAt: null },
        { leftAt: new Date() }
      );
    }

    await User.findByIdAndUpdate(residentUserId, {
      addressId: null,
      addressRole: null,
      streetGroupId: null,
      townId: null,
    });

    res.json({ message: "Resident removed" });
  }
);

router.post(
  "/addresses/:id/ownership/transfer",
  requireAuth,
  requireVerified,
  async (req: AuthenticatedRequest, res) => {
    const addressId = req.params.id;
    const { newOwnerId } = z.object({ newOwnerId: z.string() }).parse(req.body);
    const user = req.user!;

    if (!user.isAdmin) {
      const role = await ensureOwnerOrAdmin(user._id, new Types.ObjectId(addressId));
      if (role !== "OWNER") {
        return res.status(403).json({ message: "Only owners or admins can transfer ownership" });
      }
    }

    const newOwner = await AddressResident.findOne({
      addressId,
      userId: newOwnerId,
      state: "ACTIVE",
    });

    if (!newOwner) {
      return res.status(400).json({ message: "New owner must be an active resident" });
    }

    await AddressResident.updateMany({ addressId, role: "OWNER", state: "ACTIVE" }, { role: "RESIDENT" });
    newOwner.role = "OWNER";
    await newOwner.save();

    await Address.findByIdAndUpdate(addressId, { ownerUserId: newOwnerId });

    await User.findByIdAndUpdate(newOwnerId, { addressRole: "OWNER" });
    if (!user.isAdmin) {
      await User.findByIdAndUpdate(user._id, { addressRole: "RESIDENT" });
    }

    res.json({ message: "Ownership transferred" });
  }
);

export default router;
