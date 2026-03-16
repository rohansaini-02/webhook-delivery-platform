import { Request, Response, NextFunction } from 'express';

/**
 * API Key Authentication Middleware
 *
 * Checks for a valid API key in the Authorization header.
 * Header format: Authorization: Bearer <API_KEY>
 *
 * The API key must match the API_KEY env variable.
 * This guards all admin/management routes.
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid Authorization header. Format: Bearer <API_KEY>',
    });
    return;
  }

  const providedKey = authHeader.split(' ')[1];
  const validKey = process.env.API_KEY;

  if (!validKey) {
    res.status(500).json({
      status: 'error',
      message: 'Server is missing API_KEY configuration.',
    });
    return;
  }

  if (providedKey !== validKey) {
    res.status(403).json({
      status: 'error',
      message: 'Forbidden: Invalid API key.',
    });
    return;
  }

  next();
};
