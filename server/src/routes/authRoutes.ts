import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { signToken, verifyToken } from "../utils/jwt.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  postcode: z.string().min(5).max(8),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid details", errors: parsed.error.flatten() });
  }

  const { email, password, firstName, postcode } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Account already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash,
    firstName,
    postcode: postcode.toUpperCase(),
    emailVerifiedAt: null,
  });

  const token = signToken({ sub: user.id, type: "verify" }, { expiresIn: "24h" });
  const verifyLink = `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/verify-email?token=${token}`;

  await sendEmail(
    user.email,
    "Verify your ConnectedCommunity account",
    `<p>Hello ${user.firstName},</p><p>Confirm your email to join your neighbours:</p><p><a href="${verifyLink}">Verify my account</a></p>`
  );

  if (!process.env.RESEND_API_KEY) {
    console.log("🔗 Email verification link:", verifyLink);
  }

  res.status(201).json({ message: "Account created. Please verify your email." });
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ sub: user.id });
  res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin } });
});

router.get("/verify", async (req, res) => {
  const token = req.query.token;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Missing token" });
  }

  try {
    const payload = verifyToken<{ sub: string; type?: string }>(token);
    if (payload.type !== "verify") {
      return res.status(400).json({ message: "Invalid token" });
    }
    const user = await User.findByIdAndUpdate(
      payload.sub,
      { emailVerifiedAt: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Email verified", user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Verify error", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
