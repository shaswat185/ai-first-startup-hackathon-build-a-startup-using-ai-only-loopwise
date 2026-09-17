/**
 * Standardized application error.
 * Thrown anywhere in the app and caught by the global error handler,
 * which turns it into the consistent { message, code, details } response shape.
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR", details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details = [], code = "BAD_REQUEST") {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
    return new ApiError(401, message, code);
  }

  static forbidden(message = "You do not have access to this resource", code = "FORBIDDEN") {
    return new ApiError(403, message, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new ApiError(404, message, code);
  }

  static conflict(message, code = "CONFLICT") {
    return new ApiError(409, message, code);
  }

  static internal(message = "Something went wrong", code = "INTERNAL_ERROR") {
    return new ApiError(500, message, code);
  }

  static badGateway(message = "Upstream service failed", code = "UPSTREAM_ERROR") {
    return new ApiError(502, message, code);
  }
}
