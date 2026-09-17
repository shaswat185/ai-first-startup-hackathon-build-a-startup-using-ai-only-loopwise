import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  // Throws JsonWebTokenError / TokenExpiredError on failure - handled by global error middleware.
  return jwt.verify(token, env.jwtSecret);
}
