import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./requireAuth.js";

export function requireVerified(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.emailVerifiedAt) {
    return res.status(403).json({ message: "Please verify your email to continue" });
  }
  next();
}
