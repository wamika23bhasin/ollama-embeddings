/**
 * 404 – Route not found
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route '${req.originalUrl}' not found`,
  });
};

/**
 * Global error handler
 * Attach a `statusCode` property to any Error to control the HTTP status.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error ${statusCode}] ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
