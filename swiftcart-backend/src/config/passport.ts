import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/User';
import { env } from './env';
import logger from '../utils/logger';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV === 'production' ? 'https://api.yourdomain.com' : 'http://localhost:3000'}/api/v1/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.info('Google OAuth callback', { email: profile.emails?.[0]?.value });

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'), undefined);
          }

          // Find user by email or Google provider ID
          let user = await User.findOne({
            $or: [
              { email },
              { 'oauthProviders.provider': 'google', 'oauthProviders.providerId': profile.id },
            ],
          });

          if (user) {
            // User exists - check if Google provider is linked
            const hasGoogleProvider = user.oauthProviders?.some(
              (p) => p.provider === 'google' && p.providerId === profile.id
            );

            if (!hasGoogleProvider) {
              // Link Google provider to existing account
              if (!user.oauthProviders) {
                user.oauthProviders = [];
              }
              user.oauthProviders.push({
                provider: 'google',
                providerId: profile.id,
                email,
              });
              // Mark email as verified if from Google
              if (!user.isEmailVerified) {
                user.isEmailVerified = true;
              }
              await user.save();
            }
          } else {
            // Create new user
            user = new User({
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              oauthProviders: [
                {
                  provider: 'google',
                  providerId: profile.id,
                  email,
                },
              ],
              isEmailVerified: true, // Google emails are verified
            });
            await user.save();
          }

          return done(null, user);
        } catch (error: any) {
          logger.error('Google OAuth error', { error: error.message });
          return done(error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth credentials not configured');
}

// Facebook OAuth Strategy
if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: env.FACEBOOK_APP_ID,
        clientSecret: env.FACEBOOK_APP_SECRET,
        callbackURL: `${env.NODE_ENV === 'production' ? 'https://api.yourdomain.com' : 'http://localhost:3000'}/api/v1/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.info('Facebook OAuth callback', { email: profile.emails?.[0]?.value });

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Facebook'), undefined);
          }

          // Find user by email or Facebook provider ID
          let user = await User.findOne({
            $or: [
              { email },
              { 'oauthProviders.provider': 'facebook', 'oauthProviders.providerId': profile.id },
            ],
          });

          if (user) {
            // User exists - check if Facebook provider is linked
            const hasFacebookProvider = user.oauthProviders?.some(
              (p) => p.provider === 'facebook' && p.providerId === profile.id
            );

            if (!hasFacebookProvider) {
              // Link Facebook provider to existing account
              if (!user.oauthProviders) {
                user.oauthProviders = [];
              }
              user.oauthProviders.push({
                provider: 'facebook',
                providerId: profile.id,
                email,
              });
              // Mark email as verified if from Facebook
              if (!user.isEmailVerified) {
                user.isEmailVerified = true;
              }
              await user.save();
            }
          } else {
            // Create new user
            user = new User({
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              oauthProviders: [
                {
                  provider: 'facebook',
                  providerId: profile.id,
                  email,
                },
              ],
              isEmailVerified: true, // Facebook emails are verified
            });
            await user.save();
          }

          return done(null, user);
        } catch (error: any) {
          logger.error('Facebook OAuth error', { error: error.message });
          return done(error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('Facebook OAuth credentials not configured');
}

export default passport;

