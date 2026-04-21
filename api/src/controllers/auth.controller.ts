import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/db';
import logger from '../config/logger';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ status: 'error', message: 'Username and password required' });
    return;
  }

  const existingAdmin = await prisma.admin.findUnique({ where: { username } });
  if (existingAdmin) {
    res.status(400).json({ status: 'error', message: 'Username is already taken' });
    return;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newApiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

  const newAdmin = await prisma.admin.create({
    data: {
      email,
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
      res.status(401).json({ status: 'error', message: 'This account uses Google Sign-In. Please use the Google button.' });
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
    res.status(400).json({ status: 'error', message: 'Google accounts cannot update password here.' });
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

export const googleSignIn = async (req: Request, res: Response): Promise<void> => {
  const { code, redirectUri, idToken } = req.body;

  try {
    let email: string | undefined;
    let googleName: string | undefined;

    if (code && redirectUri) {
      // ── Authorization Code Flow (from Expo Go / mobile) ──
      // Exchange the authorization code for tokens using Google's token endpoint
      const axios = require('axios').default;
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const { id_token } = tokenResponse.data;
      if (!id_token) {
        res.status(400).json({ status: 'error', message: 'Failed to get ID token from Google' });
        return;
      }

      // Verify the id_token
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      googleName = payload?.name;

    } else if (idToken) {
      // ── Direct ID Token Flow (legacy / web) ──
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      googleName = payload?.name;

    } else {
      res.status(400).json({ status: 'error', message: 'Missing authorization code or ID token' });
      return;
    }

    if (!email) {
      res.status(400).json({ status: 'error', message: 'Could not retrieve email from Google' });
      return;
    }

    const username = email.split('@')[0]; // Simple username fallback

    // Find if user already exists
    let admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      // Check if username already taken, if so append a random suffix
      const existingUsername = await prisma.admin.findUnique({ where: { username } });
      const finalUsername = existingUsername ? `${username}_${crypto.randomBytes(2).toString('hex')}` : username;

      // Create new user via Google
      const newApiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');
      admin = await prisma.admin.create({
        data: {
          email,
          username: finalUsername,
          authProvider: 'GOOGLE',
          apiKey: newApiKey,
        },
      });
      logger.info(`New user registered via Google: ${email}`);
    } else {
      logger.info(`User logged in via Google: ${email}`);
    }

    res.status(200).json({
      status: 'ok',
      message: 'Google Sign-In successful',
      data: {
        apiKey: admin.apiKey,
        username: admin.username,
        email: admin.email,
        authProvider: admin.authProvider,
      },
    });
  } catch (error: any) {
    logger.error(`Google Auth Error: ${error?.response?.data || error.message || error}`);
    res.status(401).json({ status: 'error', message: 'Google authentication failed. Please try again.' });
  }
};

/**
 * GET /api/v1/auth/google/callback
 * Google redirects here after user consent.
 * We exchange the code for tokens, create/find user, then redirect back to the mobile app.
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    logger.error(`Google OAuth error: ${oauthError}`);
    res.status(400).send('Google authentication was denied. You can close this window.');
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).send('Missing authorization code. You can close this window.');
    return;
  }

  try {
    const axios = require('axios').default;
    
    // Determine the callback URL (must match the public tunnel URL exactly)
    const publicBaseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${publicBaseUrl}/api/v1/auth/google/callback`;

    // logger.info('[Auth] Google Callback code received');

    // Exchange the authorization code for tokens
    let tokenResponse;
    try {
      tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      });
    } catch (tokenErr: any) {
      console.error('[Auth] GOOGLE TOKEN EXCHANGE FAILED!');
      const errDetail = JSON.stringify(tokenErr.response?.data || tokenErr.message);
      console.error('[Auth] Error Data:', errDetail);
      res.status(400).send(`Google Handshake Failed! Error: ${errDetail}. Check your Client Secret in .env.`);
      return;
    }

    const { id_token } = tokenResponse.data;
    if (!id_token) {
      res.status(400).send('No ID Token from Google.');
      return;
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload?.email;

      if (!email) {
        res.status(400).send('Email missing from Google profile.');
        return;
      }

      // Find or create user with DB Error checking
      // Find or create admin with DB Error checking
      let admin;
      try {
        admin = await prisma.admin.findUnique({ where: { email } });
        
        if (!admin) {
          console.log('[Auth] Creating new Google admin:', email);
          admin = await prisma.admin.create({
            data: {
              username: email.split('@')[0],
              email: email,
              passwordHash: '',
              apiKey: 'sk_live_' + crypto.randomBytes(32).toString('hex'),
              authProvider: 'GOOGLE'
            },
          });
        }
      } catch (dbErr: any) {
        console.error('[Auth] DB ERROR:', dbErr.message);
        res.status(500).send(`Database Connection Failed! Error: ${dbErr.message}`);
        return;
      }

      // 3. Redirect back to mobile. In development (Expo Go), we use the exp:// scheme.
      // In production/custom builds, we use our custom scheme.
      let appRedirect = `webhook-admin://auth/callback?apiKey=${encodeURIComponent(admin.apiKey)}&username=${encodeURIComponent(admin.username)}&email=${encodeURIComponent(admin.email || '')}`;
      
      // Fallback for Expo Go (Physical devices)
      const isExpoGo = req.headers['user-agent']?.includes('Expo') || req.query.expo === 'true';
      if (isExpoGo) {
        // Redirect to Expo Go (exp://)
        appRedirect = `exp://u.expo.dev/rohanlabs/admin-app/auth/callback?apiKey=${encodeURIComponent(admin.apiKey)}&username=${encodeURIComponent(admin.username)}&email=${encodeURIComponent(admin.email || '')}`;
      }

      console.log('[Auth] Redirecting to:', isExpoGo ? 'Expo Go' : 'Custom App', appRedirect);
      res.redirect(appRedirect);

    } catch (verifyErr: any) {
      console.error('[Auth] Token Verification Failed:', verifyErr.message);
      res.status(400).send(`Verification failed! ${verifyErr.message}`);
    }

  } catch (error: any) {
    console.error('[Auth] Global Callback Error:', error.message);
    res.status(500).send('Authentication failed. Please try again.');
  }
};
