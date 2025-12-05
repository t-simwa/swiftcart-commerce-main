import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { createError } from './errorHandler';

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Zod schema
 */
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return next(
          createError('Validation failed', 400, 'INVALID_INPUT', details)
        );
      }

      next(createError('Validation error', 500, 'VALIDATION_ERROR'));
    }
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  }),

  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),

  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
};

