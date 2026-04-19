import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * API Key Authentication Middleware
 *
 * Checks for a valid API key in the Authorization header or x-api-key header.
 */
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const xApiKey = req.headers['x-api-key'];
  let providedKey: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.split(' ')[1];
  } else if (xApiKey && typeof xApiKey === 'string') {
    providedKey = xApiKey;
  }

  if (!providedKey) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid authentication. Provide API Key in "Authorization: Bearer <KEY>" or "x-api-key" header.',
    });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { apiKey: providedKey },
    });

    if (!admin) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden: Invalid API key.',
      });
      return;
    }

    req.admin = admin; // Attach admin to request
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
