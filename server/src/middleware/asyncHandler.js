// Express 4 does not automatically forward rejected async route handlers.
// This keeps provider and database failures inside the central error handler.
export const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
