import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/db';
import logger from '../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ status: 'error', message: 'Username and password required' });
    return;
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      res.status(400).json({ status: 'error', message: 'Username is already taken' });
      return;
    }

    // Also check for duplicate email if provided
    if (email) {
      const existingEmail = await prisma.admin.findUnique({ where: { email } });
      if (existingEmail) {
        res.status(400).json({ status: 'error', message: 'Email is already registered' });
        return;
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newApiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

    const newAdmin = await prisma.admin.create({
      data: {
        email: email || null,
        username,
        passwordHash,
        apiKey: newApiKey,
      },
    });

    res.status(201).json({
      status: 'ok',
      message: 'User registered successfully',
      data: {
        apiKey: newAdmin.apiKey,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (err: any) {
    // Handle Prisma unique constraint violations
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      res.status(400).json({ status: 'error', message: `This ${field} is already taken.` });
      return;
    }
    logger.error(`Registration error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ status: 'error', message: 'Registration failed. Please try again.' });
  }
};

/**
 * POST /auth/login
 * Validates user credentials and returns a secure API Key for session management.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  logger.info(`Login attempt for user: "${username}"`);
  
  if (!username || !password) {
    res.status(400).json({ status: 'error', message: 'Username and password required' });
    return;
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });
    if (!admin) {
      logger.warn(`Login failed: User "${username}" not found in database.`);
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    if (!admin.passwordHash) {
      res.status(401).json({ status: 'error', message: 'No password set for this account.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      logger.warn(`Login failed: Incorrect password for user "${username}".`);
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    logger.info(`Login successful for user: "${username}"`);

    res.json({
      status: 'ok',
      message: 'Login successful',
      data: {
        apiKey: admin.apiKey,
        username: admin.username,
      },
    });
  } catch (err: any) {
    logger.error(`Login DB error for "${username}": ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable. Please try again in a moment.',
    });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
     res.status(401).json({ status: 'error', message: 'Unauthorized' });
     return;
  }
  const apiKey = authHeader.split(' ')[1];

  const admin = await prisma.admin.findUnique({ where: { apiKey } });
  if (!admin) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return;
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ status: 'error', message: 'Current and new password required' });
    return;
  }

  if (!admin.passwordHash) {
    res.status(400).json({ status: 'error', message: 'No password set for this account.' });
    return;
  }

  const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!validPassword) {
    res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
    return;
  }

  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({ status: 'ok', message: 'Password updated successfully' });
};

export const regenerateKey = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
     res.status(401).json({ status: 'error', message: 'Unauthorized' });
     return;
  }
  const apiKey = authHeader.split(' ')[1];

  const admin = await prisma.admin.findUnique({ where: { apiKey } });
  if (!admin) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return;
  }

  const newKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

  await prisma.admin.update({
    where: { id: admin.id },
    data: { apiKey: newKey },
  });

  res.json({
    status: 'ok',
    message: 'API Key regenerated successfully',
    data: { apiKey: newKey },
  });
};
