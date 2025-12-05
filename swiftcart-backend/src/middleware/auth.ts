import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { userDoc?: any };
    }
  }
}

/**
 * Protect routes - require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw createError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw createError('User no longer exists.', 401, 'UNAUTHORIZED');
    }

    // Attach user to request
    req.user = {
      ...decoded,
      userDoc: user,
    };

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      logger.error('Authentication error', { error: error.message, path: req.path });
      next(createError('Authentication failed.', 401, 'UNAUTHORIZED'));
    }
  }
};

/**
 * Role-based access control (RBAC)
 */
export const authorize = (...roles: ('customer' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      throw createError(
        `Access denied. Required role: ${roles.join(' or ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token is present but don't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (user) {
          req.user = {
            ...decoded,
            userDoc: user,
          };
        }
      } catch (error) {
        // Token invalid, but continue without user
        // This allows public access with optional user context
      }
    }

    next();
  } catch (error) {
    next();
  }
};

