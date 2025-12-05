# OAuth Social Authentication Setup Guide

This guide explains how to set up Google and Facebook OAuth authentication for the SwiftCart platform.

## 📋 Overview

The platform supports social authentication via Google and Facebook OAuth 2.0. Users can sign in or register using their social media accounts without creating a separate password.

---

## 🔧 Backend Setup

### 1. Install Dependencies

The required dependencies are already added to `package.json`. Install them:

```bash
# From root directory (recommended)
pnpm install

# Or from backend directory only
cd swiftcart-backend
pnpm install
```

Required packages:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-facebook` - Facebook OAuth strategy
- `express-session` - Session management for OAuth flow

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Facebook
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

---

## 🔵 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External (for public use)
   - App name: SwiftCart
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: SwiftCart Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://api.yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/v1/auth/google/callback` (development)
     - `https://api.yourdomain.com/api/v1/auth/google/callback` (production)
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### Step 2: Update Callback URL

The callback URL in `src/config/passport.ts` is configured as:
- Development: `http://localhost:3000/api/v1/auth/google/callback`
- Production: `https://api.yourdomain.com/api/v1/auth/google/callback`

Update the production URL in `src/config/passport.ts` to match your API domain.

---

## 🔵 Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as app type
4. Fill in app details:
   - App Display Name: SwiftCart
   - App Contact Email: your-email@example.com
5. Add **Facebook Login** product:
   - Go to **Products** > **Facebook Login** > **Set Up**
   - Choose **Web** platform
6. Configure Facebook Login:
   - Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/v1/auth/facebook/callback` (development)
     - `https://api.yourdomain.com/api/v1/auth/facebook/callback` (production)
7. Go to **Settings** > **Basic**:
   - Copy **App ID** and **App Secret** to your `.env` file
   - Add **App Domains**: `yourdomain.com`
   - Add **Privacy Policy URL** and **Terms of Service URL**

### Step 2: Request Email Permission

1. Go to **Products** > **Facebook Login** > **Settings**
2. Under **Permissions**, add `email` to the list
3. Save changes

### Step 3: Update Callback URL

The callback URL in `src/config/passport.ts` is configured as:
- Development: `http://localhost:3000/api/v1/auth/facebook/callback`
- Production: `https://api.yourdomain.com/api/v1/auth/facebook/callback`

Update the production URL in `src/config/passport.ts` to match your API domain.

---

## 🎨 Frontend Setup

The frontend is already configured with OAuth buttons on the Login and Register pages. No additional setup is required.

### OAuth Flow

1. User clicks "Sign in with Google" or "Sign in with Facebook"
2. User is redirected to the provider's login page
3. After authentication, user is redirected back to `/auth/callback`
4. Frontend extracts tokens from URL and stores them
5. User is logged in and redirected to home page

---

## 🧪 Testing OAuth

### Test Google OAuth

1. Start the backend server:
   ```bash
   # From root directory
   pnpm dev:backend
   
   # Or from backend directory
   cd swiftcart-backend
   pnpm dev
   ```

2. Start the frontend server:
   ```bash
   # From root directory
   pnpm dev:frontend
   
   # Or from frontend directory
   cd swiftcart-frontend
   pnpm dev
   ```

3. Navigate to `http://localhost:8080/login`
4. Click "Sign in with Google"
5. Complete Google authentication
6. Verify you're redirected back and logged in

### Test Facebook OAuth

1. Follow steps 1-2 above
2. Navigate to `http://localhost:8080/login`
3. Click "Sign in with Facebook"
4. Complete Facebook authentication
5. Verify you're redirected back and logged in

---

## 🔒 Security Considerations

1. **Never commit `.env` file** - Keep OAuth secrets secure
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Validate redirect URIs** - Only allow trusted domains
4. **Rotate secrets regularly** - Change OAuth credentials periodically
5. **Monitor OAuth usage** - Watch for suspicious activity

---

## 🐛 Troubleshooting

### "Redirect URI mismatch" Error

- Ensure callback URLs in provider settings match exactly
- Check for trailing slashes
- Verify protocol (http vs https)
- Check port numbers

### "Invalid client" Error

- Verify Client ID and Client Secret are correct
- Check if credentials are for the right environment
- Ensure OAuth consent screen is configured

### "Email not provided" Error

- For Facebook: Ensure `email` permission is requested
- Check OAuth scopes in passport configuration
- Verify user has granted email permission

### Callback Not Working

- Check backend logs for errors
- Verify CORS settings allow redirects
- Ensure session middleware is configured
- Check if passport strategies are initialized

---

## 📝 API Endpoints

### Google OAuth

- **Initiate**: `GET /api/v1/auth/google`
- **Callback**: `GET /api/v1/auth/google/callback`

### Facebook OAuth

- **Initiate**: `GET /api/v1/auth/facebook`
- **Callback**: `GET /api/v1/auth/facebook/callback`

---

## 🔄 User Account Linking

The system automatically:
- Creates a new account if email doesn't exist
- Links OAuth provider to existing account if email matches
- Marks email as verified for OAuth users
- Stores provider information in user profile

Users can link multiple OAuth providers to the same account by signing in with different providers using the same email address.

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Passport.js Documentation](http://www.passportjs.org/)

---

**Note**: OAuth features are optional. The platform works without OAuth credentials configured, but OAuth buttons will not function until credentials are added.

