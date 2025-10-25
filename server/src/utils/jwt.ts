import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  sub: string;
  type?: string;
  [key: string]: unknown;
}

export function signToken(payload: TokenPayload, options?: jwt.SignOptions) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
    ...options,
  });
}

export function verifyToken<T = TokenPayload>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as T;
}
