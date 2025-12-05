import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { env } from '../config/env';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    logger.info('User registration attempt', { email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration failed: email already exists', { email });
      return next(createError('Email already registered', 400, 'DUPLICATE_EMAIL'));
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
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

    logger.info('User registered successfully', { userId: user._id, email });

    // TODO: Send verification email with verificationToken
    // For now, we'll return it in the response (remove in production)
    if (env.NODE_ENV === 'development') {
      logger.debug('Email verification token (dev only)', { token: verificationToken });
    }

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
        // Only include in development
        ...(env.NODE_ENV === 'development' && {
          verificationToken, // Remove in production
        }),
      },
    });
  } catch (error: any) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Registration failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn('Login failed: user not found', { email });
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn('Login failed: invalid password', { email, userId: user._id });
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Generate tokens
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

    logger.info('User logged in successfully', { userId: user._id, email });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Login failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return next(createError('Refresh token is required', 400, 'INVALID_INPUT'));
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error: any) {
      logger.warn('Invalid refresh token', { error: error.message });
      return next(createError('Invalid or expired refresh token', 401, 'INVALID_TOKEN'));
    }

    // Find refresh token in database
    const refreshTokenDoc = await RefreshToken.findOne({
      token,
      user: decoded.userId,
    });

    if (!refreshTokenDoc || refreshTokenDoc.revokedAt) {
      logger.warn('Refresh token not found or revoked', { userId: decoded.userId });
      return next(createError('Invalid or expired refresh token', 401, 'INVALID_TOKEN'));
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      logger.warn('Refresh token expired', { userId: decoded.userId });
      return next(createError('Refresh token expired', 401, 'TOKEN_EXPIRED'));
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      logger.warn('User not found during token refresh', { userId: decoded.userId });
      return next(createError('User not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // Revoke old refresh token
    refreshTokenDoc.revokedAt = new Date();
    refreshTokenDoc.replacedBy = null; // Will be set after saving new token
    await refreshTokenDoc.save();

    // Save new refresh token
    const newRefreshTokenDoc = new RefreshToken({
      token: newRefreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    await newRefreshTokenDoc.save();

    // Update replacedBy reference
    refreshTokenDoc.replacedBy = newRefreshTokenDoc._id;
    await refreshTokenDoc.save();

    logger.info('Token refreshed successfully', { userId: user._id });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error: any) {
    logger.error('Token refresh error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Token refresh failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Logout user (revoke refresh token)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return next(createError('Refresh token is required', 400, 'INVALID_INPUT'));
    }

    // Find and revoke refresh token
    const refreshTokenDoc = await RefreshToken.findOne({
      token,
      user: req.user!.userId,
    });

    if (refreshTokenDoc && !refreshTokenDoc.revokedAt) {
      refreshTokenDoc.revokedAt = new Date();
      await refreshTokenDoc.save();
    }

    logger.info('User logged out', { userId: req.user!.userId });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Logout failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');

    if (!user) {
      return next(createError('User not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get me error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Failed to get user', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    logger.info('Password reset request', { email });

    const user = await User.findOne({ email });

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      logger.warn('Password reset: email not found', { email });
      // Return success anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send password reset email with resetToken
    // For now, we'll return it in the response (remove in production)
    if (env.NODE_ENV === 'development') {
      logger.debug('Password reset token (dev only)', { token: resetToken });
    }

    logger.info('Password reset token generated', { userId: user._id, email });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'If the email exists, a password reset link has been sent.',
      // Only include in development
      ...(env.NODE_ENV === 'development' && {
        resetToken, // Remove in production
      }),
    });
  } catch (error: any) {
    logger.error('Forgot password error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Failed to process password reset', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    logger.info('Password reset attempt');

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      logger.warn('Password reset: invalid or expired token');
      return next(createError('Invalid or expired reset token', 400, 'INVALID_TOKEN'));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany(
      { user: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );

    logger.info('Password reset successful', { userId: user._id });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error: any) {
    logger.error('Reset password error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Password reset failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    logger.info('Email verification attempt');

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      logger.warn('Email verification: invalid or expired token');
      return next(createError('Invalid or expired verification token', 400, 'INVALID_TOKEN'));
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info('Email verified successfully', { userId: user._id, email: user.email });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    logger.error('Email verification error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Email verification failed', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    logger.info('Resend verification request', { email });

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'If the email exists and is not verified, a verification link has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        status: 400,
        code: 'ALREADY_VERIFIED',
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email with verificationToken
    if (env.NODE_ENV === 'development') {
      logger.debug('Email verification token (dev only)', { token: verificationToken });
    }

    logger.info('Verification email resent', { userId: user._id, email });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'If the email exists and is not verified, a verification link has been sent.',
      // Only include in development
      ...(env.NODE_ENV === 'development' && {
        verificationToken, // Remove in production
      }),
    });
  } catch (error: any) {
    logger.error('Resend verification error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Failed to resend verification', 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Change password (for authenticated users)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    logger.info('Password change request', { userId: req.user!.userId });

    // Get user with password
    const user = await User.findById(req.user!.userId).select('+password');

    if (!user) {
      return next(createError('User not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      logger.warn('Password change failed: invalid current password', { userId: user._id });
      return next(createError('Current password is incorrect', 400, 'INVALID_PASSWORD'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens except current one (optional - for security)
    // For now, we'll keep existing sessions active

    logger.info('Password changed successfully', { userId: user._id });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    logger.error('Change password error', { error: error.message, stack: error.stack });
    next(createError(error.message || 'Password change failed', 500, 'SERVER_ERROR'));
  }
};

