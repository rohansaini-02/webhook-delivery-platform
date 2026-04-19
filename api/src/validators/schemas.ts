import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

// ─── Subscription Schemas ─────────────────────────────────────────────────────

export const createSubscriptionSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string().min(1)).min(1, 'At least one event type is required'),
  secret: z.string().optional(),
  environment: z.enum(['PROD', 'STAGE']).optional().default('PROD'),
});

export const updateSubscriptionSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  events: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
}).refine(
  data => data.url !== undefined || data.events !== undefined || data.isActive !== undefined,
  { message: 'At least one field (url, events, or isActive) must be provided' }
);

// ─── Event Schemas ────────────────────────────────────────────────────────────

export const ingestEventSchema = z.object({
  type: z.string().min(1, 'Event type is required').max(255),
  payload: z.record(z.string(), z.any()).refine(
    val => val !== null && typeof val === 'object',
    { message: 'Payload must be a JSON object' }
  ),
});
