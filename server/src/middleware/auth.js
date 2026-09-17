import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * On success, attaches req.userId (string) - always the source of truth for
 * "who is making this request". Never trust a userId from the request body.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err); // normalized to INVALID_TOKEN / TOKEN_EXPIRED by the global error handler
  }
}
