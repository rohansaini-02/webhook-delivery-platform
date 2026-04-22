import { Router } from 'express';
import { login, updatePassword, regenerateKey, register } from '../controllers/auth.controller';
import { apiKeyAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema, updatePasswordSchema } from '../validators/schemas';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and get API key
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error or username taken
 */
router.post('/register', validate(registerSchema), register);


// Protected routes (require current API key in Authorization header)
/**
 * @openapi
 * /api/v1/auth/update-password:
 *   post:
 *     summary: Update account password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/update-password', apiKeyAuth, validate(updatePasswordSchema), updatePassword);

/**
 * @openapi
 * /api/v1/auth/regenerate-key:
 *   post:
 *     summary: Regenerate API key
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Key regenerated
 */
router.post('/regenerate-key', apiKeyAuth, regenerateKey);

export default router;
