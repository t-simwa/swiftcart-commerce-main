import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { generateTokenPair } from '../utils/jwt';
import { RefreshToken } from '../models/RefreshToken';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { env } from '../config/env';

/**
 * OAuth callback handler - generates JWT tokens and redirects to frontend
 */
export const oauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as any;

    if (!user) {
      logger.error('OAuth callback: No user found');
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Save refresh token
    const refreshTokenDoc = new RefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    await refreshTokenDoc.save();

    logger.info('OAuth login successful', { userId: user._id, email: user.email });

    // Redirect to frontend with tokens in URL hash (more secure than query params)
    // Frontend will extract tokens and store them
    const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    logger.error('OAuth callback error', { error: error.message, stack: error.stack });
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * Google OAuth initiation
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Google OAuth callback
 */
export const googleCallback = passport.authenticate('google', {
  failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed`,
  session: false, // We use JWT, not sessions
});

/**
 * Facebook OAuth initiation
 */
export const facebookAuth = passport.authenticate('facebook', {
  scope: ['email'],
});

/**
 * Facebook OAuth callback
 */
export const facebookCallback = passport.authenticate('facebook', {
  failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed`,
  session: false, // We use JWT, not sessions
});

