import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic Zod validation middleware.
 * 
 * Parses req.body against the provided schema.
 * - On success: replaces req.body with parsed/sanitized data and calls next()
 * - On failure: returns 400 with structured field-level error messages
 */
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Replace with parsed data (applies defaults, strips unknown fields)
    req.body = result.data;
    next();
  };
