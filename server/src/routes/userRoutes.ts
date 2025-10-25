import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    postcode: user.postcode,
    emailVerifiedAt: user.emailVerifiedAt,
    addressId: user.addressId,
    addressRole: user.addressRole,
    streetGroupId: user.streetGroupId,
    townId: user.townId,
    isAdmin: user.isAdmin,
  });
});

const profileSchema = z.object({
  firstName: z.string().min(1).optional(),
  postcode: z.string().min(5).max(8).optional(),
});

router.patch("/me/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid details" });
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.firstName) updates.firstName = parsed.data.firstName;
  if (parsed.data.postcode) updates.postcode = parsed.data.postcode.toUpperCase();

  const updated = await req.user!.updateOne(updates, { new: true });
  res.json({ message: "Profile updated", updates });
});

export default router;
