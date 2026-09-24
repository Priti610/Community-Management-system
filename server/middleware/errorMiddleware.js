/**
 * Centralized error handler returning structured JSON
 */
export function errorHandler(err, req, res, next) {
  console.error('Unhandled server error:', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
}

/**
 * 404 handler for unmatched API routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found.`,
  });
}
