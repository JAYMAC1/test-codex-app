import { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error", err);
  res.status(500).json({ message: "Something went wrong" });
}
