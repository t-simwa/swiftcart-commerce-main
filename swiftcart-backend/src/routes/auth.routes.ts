import { Router } from 'express';
import type { Router as RouterType } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
} from '../controllers/auth.controller';
import {
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  oauthCallback,
} from '../controllers/oauth.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  changePasswordSchema,
} from '../middleware/authValidation';
import { authLimiter } from '../middleware/rateLimiter';

const router: RouterType = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Private
 */
router.post(
  '/logout',
  protect,
  validate(refreshTokenSchema),
  logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  protect,
  getMe
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  validate(verifyEmailSchema),
  verifyEmail
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  '/resend-verification',
  authLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (for authenticated users)
 * @access  Private
 */
router.post(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  changePassword
);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', googleAuth);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', googleCallback, oauthCallback);

/**
 * @route   GET /api/v1/auth/facebook
 * @desc    Initiate Facebook OAuth login
 * @access  Public
 */
router.get('/facebook', facebookAuth);

/**
 * @route   GET /api/v1/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
router.get('/facebook/callback', facebookCallback, oauthCallback);

export default router;

