import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Centralized error handling middleware.
 * Must be the LAST middleware in app.ts.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('[ErrorHandler]', { message: err.message, stack: err.stack });

  // Handle Prisma connection errors
  if (err.message.includes('Can\'t reach database server') || err.name === 'PrismaClientInitializationError') {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed. Please check your internet connection or try again later.',
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
};

/**
 * 404 Not Found handler for unregistered routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
