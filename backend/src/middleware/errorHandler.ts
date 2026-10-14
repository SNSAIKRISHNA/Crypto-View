import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Friendly error response
  let message = err.message || 'An unexpected error occurred while fetching cryptocurrency data.';

  if (err.message && err.message.includes('429')) {
    message = 'Market data provider rate limit reached. Showing latest cached data.';
  } else if (err.message && err.message.includes('timeout')) {
    message = 'Request to crypto market data provider timed out. Please try again in a moment.';
  }

  console.error(`[ErrorHandler] [${req.method} ${req.originalUrl}] - Status ${statusCode}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
}
