import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: InstanceType<typeof User> | null;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    req.user = await User.findById(payload.sub);
    if (!req.user) {
      return res.status(401).json({ message: "Account not found" });
    }
    next();
  } catch (error) {
    console.error("Auth error", error);
    res.status(401).json({ message: "Invalid token" });
  }
}
