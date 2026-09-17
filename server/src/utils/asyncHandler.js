/**
 * Wraps an async Express route handler so any thrown/rejected error
 * is forwarded to the global error-handling middleware via next().
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
