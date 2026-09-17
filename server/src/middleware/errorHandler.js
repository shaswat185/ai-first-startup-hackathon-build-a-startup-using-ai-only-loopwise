import { ApiError } from "../utils/ApiError.js";

/**
 * Catches 404s for unmatched routes.
 */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

/**
 * Global error handler. Every error, whether an ApiError or an unexpected
 * exception (Mongoose, JWT, Groq, etc.), is normalized to:
 * { message, code, details }
 *
 * Technical details are always logged server-side; only safe, human-readable
 * messages are ever sent to the client.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let code = err.code || "INTERNAL_ERROR";
  let details = err.details || [];

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    details = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists`;
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid identifier supplied";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Your session has expired. Please log in again.";
  }

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  } else {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${statusCode} ${code}: ${message}`);
  }

  res.status(statusCode).json({
    message,
    code,
    details,
  });
}
