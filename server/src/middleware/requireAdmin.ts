import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./requireAuth.js";

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
}
