import { z } from 'zod';

/**
 * Register validation schema
 */
export const registerSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
    firstName: z.union([z.string().max(50, 'First name too long'), z.literal('')]).optional(),
    lastName: z.union([z.string().max(50, 'Last name too long'), z.literal('')]).optional(),
    phone: z
      .union([
        z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'),
        z.literal(''),
      ])
      .optional(),
  }),
};

/**
 * Login validation schema
 */
export const loginSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
};

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
  }),
};

/**
 * Verify email validation schema
 */
export const verifyEmailSchema = {
  params: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
};

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = {
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
};

/**
 * Change password validation schema (for authenticated users)
 */
export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
  }),
};

