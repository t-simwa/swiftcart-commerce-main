# Deployment Guide: Vercel (Frontend) + Render (Backend)

**Step-by-step guide to deploy SwiftCart frontend to Vercel and backend to Render**

> ⚠️ **Important:** Deploy your **code repositories** directly, NOT Docker containers. Vercel and Render will build your code automatically. Docker is for local development and self-hosting.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (free tier available)
- ✅ Render account (free tier available)
- ✅ MongoDB Atlas account (free tier available) or MongoDB connection string
- ✅ Your code pushed to a GitHub repository

---

## 🎯 Overview

This guide will deploy:
- **Frontend** → Vercel (React app)
- **Backend** → Render (Express API with Socket.io)
- **Database** → MongoDB Atlas (cloud database)
- **Cache** → Upstash Redis (optional, free tier available)

> ✅ **Monorepo Support:** Both Vercel and Render support monorepos! You can use the **same GitHub repository** for both deployments by setting the **Root Directory** to `swiftcart-frontend` (Vercel) and `swiftcart-backend` (Render).

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Backend

1. **Ensure your backend is ready:**
   ```bash
   cd swiftcart-backend
   # Make sure it builds successfully
   pnpm build
   ```

2. **Check your `package.json` has a start script:**
   ```json
   {
     "scripts": {
       "start": "node dist/server.js"
     }
   }
   ```

3. **Push your code to GitHub:**
   ```bash
   # From the root of your monorepo
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```
   
   **Important:** 
   - Render will pull your **entire repo** from GitHub
   - You'll set the **Root Directory** to `swiftcart-backend` so Render only builds the backend
   - Same repo can be used for both frontend (Vercel) and backend (Render)

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Verify your email

### Step 3: Create MongoDB Atlas Database (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user:
   - Username: `swiftcart-user`
   - Password: Generate a strong password (save it!)
4. Whitelist IP addresses:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allows all IPs - for Render)
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/swiftcart`)

### Step 4: Deploy Backend to Render

1. **Create a new Web Service:**
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure the service:**
   - **Name:** `swiftcart-backend` (or your preferred name)
   - **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch:** `main` (or your main branch)
   - **Root Directory:** `swiftcart-backend` ⚠️ **Important!**
   - **Runtime:** `Node` (NOT Docker - deploy from code)
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   
   **Note:** Render will:
   - Pull your code from GitHub
   - Run `pnpm install && pnpm build` to build
   - Run `pnpm start` to start your server
   - Automatically detect Node.js and pnpm

3. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:

   ```bash
   # Server
   NODE_ENV=production
   PORT=10000
   API_VERSION=v1
   
   # Database (use your MongoDB Atlas connection string)
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swiftcart?retryWrites=true&w=majority
   
   # JWT Secrets (generate strong secrets!)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   
   # Redis (optional - use Upstash Redis free tier)
   REDIS_HOST=your-redis-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   
   # Elasticsearch (optional - can skip for now)
   ELASTICSEARCH_NODE=http://localhost:9200
   
   # Frontend URL (we'll update this after deploying frontend)
   FRONTEND_URL=https://your-frontend.vercel.app
   
   # M-Pesa (if using)
   MPESA_CONSUMER_KEY=your-consumer-key
   MPESA_CONSUMER_SECRET=your-consumer-secret
   MPESA_SHORTCODE=your-shortcode
   MPESA_PASSKEY=your-passkey
   MPESA_ENVIRONMENT=production
   
   # OAuth (if using)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```

   **Important Notes:**
   - Render uses port `10000` by default (or check what Render assigns)
   - Generate JWT secrets: `openssl rand -base64 32`
   - For Redis, use [Upstash](https://upstash.com) free tier
   - Leave `FRONTEND_URL` as placeholder for now, update after frontend deployment

4. **Create the service:**
   - Click "Create Web Service"
   - Render will start building and deploying

5. **Wait for deployment:**
   - First deployment takes 5-10 minutes
   - Watch the logs for any errors
   - Once deployed, you'll get a URL like: `https://swiftcart-backend.onrender.com`

6. **Test your backend:**
   ```bash
   # Health check
   curl https://swiftcart-backend.onrender.com/api/health
   
   # Should return: {"status":"ok",...}
   ```

### Step 5: Configure Render Settings

1. **Auto-deploy:**
   - Settings → Auto-Deploy: `Yes` (deploys on every push to main branch)

2. **Health Check:**
   - Settings → Health Check Path: `/api/health`

3. **Save your backend URL:**
   - Copy your Render backend URL: `https://swiftcart-backend.onrender.com`
   - You'll need this for the frontend deployment

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Frontend

1. **Check your frontend builds:**
   ```bash
   cd swiftcart-frontend
   pnpm build
   ```

2. **Verify environment variable usage:**
   - Your frontend uses `VITE_API_URL` (already configured ✅)

3. **Push your code to GitHub:**
   ```bash
   # From the root of your monorepo
   git add .
   git commit -m "Ready for frontend deployment"
   git push origin main
   ```
   
   **Important:** 
   - Vercel will pull your **entire repo** from GitHub
   - You'll set the **Root Directory** to `swiftcart-frontend` so Vercel only builds the frontend
   - Same repo can be used for both frontend (Vercel) and backend (Render)

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Import your GitHub repository

### Step 3: Deploy Frontend to Vercel

1. **Import Project:**
   - In Vercel dashboard, click "Add New..." → "Project"
   - Import your GitHub repository
   - Select your repository

2. **Configure Project:**
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** `swiftcart-frontend` ⚠️ **Important!**
   - **Build Command:** `pnpm build` (or leave default)
   - **Output Directory:** `dist` (Vite default)
   - **Install Command:** `pnpm install`
   
   **Note:** Vercel will:
   - Pull your code from GitHub
   - Run `pnpm install` to install dependencies
   - Run `pnpm build` to build your React app
   - Serve the `dist` folder automatically
   - **No Docker needed** - Vercel handles everything

3. **Set Environment Variables:**
   Click "Environment Variables" and add:

   ```bash
   # Backend API URL (use your Render backend URL)
   VITE_API_URL=https://swiftcart-backend.onrender.com/api
   ```

   **Important:**
   - Use your actual Render backend URL
   - Include `/api` at the end
   - No trailing slash

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Takes 2-5 minutes

5. **Get your frontend URL:**
   - Once deployed, you'll get a URL like: `https://swiftcart-commerce.vercel.app`
   - Save this URL!

### Step 4: Update Backend CORS Settings

Now that you have your frontend URL, update the backend:

1. **Go back to Render dashboard:**
   - Open your backend service
   - Go to "Environment" tab

2. **Update `FRONTEND_URL`:**
   ```bash
   FRONTEND_URL=https://swiftcart-commerce.vercel.app
   ```

3. **Save and redeploy:**
   - Render will automatically redeploy with the new environment variable

---

## Part 3: Configure Additional Services (Optional)

### Redis (Upstash - Free Tier)

1. Go to [upstash.com](https://upstash.com)
2. Sign up (free tier available)
3. Create a Redis database:
   - Name: `swiftcart-redis`
   - Region: Choose closest to Render region
   - Type: `Regional`
4. Copy connection details:
   - `REDIS_HOST`: `your-db.upstash.io`
   - `REDIS_PORT`: `6379`
   - `REDIS_PASSWORD`: Copy from Upstash dashboard
5. Add to Render environment variables (already configured above)

### Elasticsearch (Optional)

For now, you can skip Elasticsearch or use a managed service later. Your backend will work without it (falls back to MongoDB search).

---

## Part 4: Final Configuration

### Update Frontend Socket.io URL

If your frontend uses Socket.io, update the socket URL:

1. **In Vercel dashboard:**
   - Go to your project → Settings → Environment Variables
   - Add (if not already set):
     ```bash
     VITE_SOCKET_URL=https://swiftcart-backend.onrender.com
     ```

2. **Redeploy frontend:**
   - Vercel will auto-redeploy, or manually trigger from "Deployments" tab

### Test Your Deployment

1. **Test Frontend:**
   ```bash
   # Open in browser
   https://swiftcart-commerce.vercel.app
   ```

2. **Test Backend API:**
   ```bash
   # Health check
   curl https://swiftcart-backend.onrender.com/api/health
   
   # Products endpoint
   curl https://swiftcart-backend.onrender.com/api/v1/products
   ```

3. **Test Frontend → Backend Connection:**
   - Open browser DevTools → Network tab
   - Visit your frontend URL
   - Check if API calls are going to your Render backend

---

## Part 5: Custom Domains (Optional)

### Add Custom Domain to Vercel

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your domain: `swiftcart.com`
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

### Add Custom Domain to Render

1. In Render dashboard → Your Service → Settings → Custom Domains
2. Add your domain: `api.swiftcart.com`
3. Follow DNS configuration instructions
4. Render will automatically provision SSL certificate

**Update environment variables:**
- Frontend: Update `VITE_API_URL` to use custom domain
- Backend: Update `FRONTEND_URL` to use custom domain

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Build fails**
```bash
# Check Render logs
# Common issues:
# - Missing dependencies in package.json
# - Build command incorrect
# - TypeScript errors
```

**Problem: Backend won't start**
```bash
# Check:
# - PORT environment variable (Render uses 10000)
# - MongoDB connection string is correct
# - All required environment variables are set
```

**Problem: CORS errors**
```bash
# Ensure FRONTEND_URL in backend matches your Vercel URL exactly
# Check backend CORS configuration in src/app.ts
```

### Frontend Issues

**Problem: Frontend can't connect to backend**
```bash
# Check:
# - VITE_API_URL is set correctly in Vercel
# - Backend URL includes /api
# - No CORS issues (check browser console)
```

**Problem: Environment variables not working**
```bash
# Vite requires VITE_ prefix
# Rebuild after adding environment variables
# Check Vercel build logs
```

**Problem: Socket.io not connecting**
```bash
# Ensure VITE_SOCKET_URL is set
# Check backend Socket.io CORS settings
# Verify WebSocket support (Render supports it)
```

### Database Issues

**Problem: MongoDB connection fails**
```bash
# Check:
# - Connection string is correct
# - IP whitelist includes 0.0.0.0/0 (allows Render)
# - Database user credentials are correct
# - Network access is enabled in Atlas
```

---

## 📊 Monitoring

### Render Monitoring

- **Logs:** Available in Render dashboard → Your Service → Logs
- **Metrics:** CPU, Memory, Request count
- **Alerts:** Set up in Settings → Notifications

### Vercel Monitoring

- **Analytics:** Available in Vercel dashboard (Pro plan)
- **Logs:** Available in Deployments → View Function Logs
- **Performance:** Built-in performance monitoring

---

## 🔄 Continuous Deployment

Both platforms support auto-deployment:

- **Render:** Auto-deploys on push to main branch (default)
- **Vercel:** Auto-deploys on push to main branch (default)

**Workflow:**
1. Push code to GitHub
2. Render builds and deploys backend
3. Vercel builds and deploys frontend
4. Both are live in 5-10 minutes

---

## 💰 Cost Estimate

**Free Tier (Sufficient for MVP):**
- **Vercel:** Free (100GB bandwidth/month)
- **Render:** Free (750 hours/month, spins down after 15min inactivity)
- **MongoDB Atlas:** Free (512MB storage)
- **Upstash Redis:** Free (10K commands/day)

**Paid (As you scale):**
- **Vercel Pro:** $20/month (unlimited bandwidth)
- **Render:** $7/month (always-on, no spin-down)
- **MongoDB Atlas:** $9/month (2GB storage)
- **Total:** ~$36/month for small-medium traffic

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend health check passes
- [ ] MongoDB Atlas connected
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Backend `FRONTEND_URL` updated
- [ ] CORS configured correctly
- [ ] Socket.io working (if using)
- [ ] Test user registration/login
- [ ] Test product listing
- [ ] Test checkout flow
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active (automatic)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Upstash Redis](https://docs.upstash.com/redis)

---

## 🎉 You're Live!

Your SwiftCart e-commerce platform is now deployed:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

Share your app with the world! 🚀

---

**Last Updated:** December 2024  
**Status:** Ready for Production Deployment

