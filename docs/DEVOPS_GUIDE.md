# DevOps & Deployment Guide for SwiftCart

**Understanding Each DevOps Component and How It Applies to Your E-Commerce Platform**

---

## 🚀 Quick Start: Recommended Setup

**For SwiftCart, we recommend:**

1. **Frontend** → **Vercel** (free tier, auto-deploy, includes CDN)
2. **Backend** → **Railway** or **Render** (supports Socket.io, auto-deploy)
3. **Database** → **MongoDB Atlas** (free tier available)
4. **Cache** → **Upstash Redis** (free tier available)
5. **Images** → **Vercel Blob** or **AWS S3**
6. **Error Tracking** → **Sentry** (free tier available)

**Why this setup?**
- ✅ Simplest to deploy (connect GitHub, add env vars, done!)
- ✅ Free tiers available
- ✅ Automatic SSL certificates
- ✅ Auto-deploy on git push
- ✅ Works with Socket.io (real-time features)
- ✅ No Docker needed (platforms handle it)

**Total cost:** ~$0-20/month for small-medium traffic

**Alternative:** Use EC2 if you want full control (more complex, but more flexible)

---

## 📋 Table of Contents

1. [Docker Configuration](#1-docker-configuration)
2. [GitHub Actions CI/CD Pipeline](#2-github-actions-cicd-pipeline)
3. [Hosting Platform (EC2 vs Vercel vs Alternatives)](#3-hosting-platform-ec2-vs-vercel-vs-alternatives)
4. [S3 Bucket Configuration](#4-s3-bucket-configuration)
5. [CloudFront CDN Setup](#5-cloudfront-cdn-setup)
6. [Environment Variable Management](#6-environment-variable-management)
7. [SSL Certificate Configuration](#7-ssl-certificate-configuration)
8. [Deployment Scripts](#8-deployment-scripts)
9. [Monitoring Setup (CloudWatch)](#9-monitoring-setup-cloudwatch)
10. [Error Tracking (Sentry)](#10-error-tracking-sentry)

---

## 1. Docker Configuration

### What is Docker?

**Simple Analogy:** Think of Docker like a shipping container. Just like how a shipping container can be moved from a ship to a truck to a train without worrying about what's inside, Docker packages your application with everything it needs (code, dependencies, runtime) into a "container" that runs the same way anywhere.

### What Does It Do?

- **Containerizes your application**: Packages your Node.js backend and React frontend into portable containers
- **Ensures consistency**: Your app runs the same way on your laptop, teammate's computer, and production server
- **Simplifies deployment**: No need to manually install Node.js, MongoDB, Redis, etc. on the server

### How It's Used in Your Project

**Current Situation:**
- You run `pnpm dev` locally and everything works
- But on a server, you'd need to manually install Node.js, pnpm, MongoDB, Redis, Elasticsearch, etc.
- Different versions or missing dependencies could break things

**With Docker:**
- Create a `Dockerfile` for your backend (tells Docker how to build your backend container)
- Create a `Dockerfile` for your frontend (tells Docker how to build your frontend container)
- Create `docker-compose.yml` (orchestrates all containers: backend, frontend, MongoDB, Redis, etc.)
- Run `docker-compose up` and everything starts together

### Example Structure

```
swiftcart-commerce-main/
├── docker/
│   ├── Dockerfile.backend      # Instructions to build backend container
│   ├── Dockerfile.frontend     # Instructions to build frontend container
│   └── docker-compose.yml      # Orchestrates all services
```

**Benefits for SwiftCart:**
- ✅ Easy to deploy anywhere (AWS, DigitalOcean, your own server)
- ✅ Consistent environment (no "works on my machine" issues)
- ✅ Easy to scale (spin up multiple containers)
- ✅ Isolated dependencies (won't conflict with other projects)

---

## 2. GitHub Actions CI/CD Pipeline

### What is CI/CD?

**CI (Continuous Integration):** Automatically tests your code every time you push to GitHub  
**CD (Continuous Deployment):** Automatically deploys your code to production after tests pass

**Simple Analogy:** Like an assembly line in a factory:
- **CI**: Quality control - tests your code automatically
- **CD**: Shipping - deploys your code automatically if tests pass

### What Does It Do?

**GitHub Actions** is a service that runs automated tasks (called "workflows") when certain events happen (like pushing code).

**Typical Workflow:**
1. You push code to GitHub
2. GitHub Actions automatically:
   - Runs tests (Jest, Cypress)
   - Checks code quality (linting)
   - Builds your application
   - If everything passes → deploys to AWS

### How It's Used in Your Project

**Current Situation:**
- You manually run tests: `pnpm test`
- You manually build: `pnpm build`
- You manually deploy (copy files, SSH into server, restart services)

**With GitHub Actions:**
- Push code → Tests run automatically → If pass → Deploy automatically
- No manual steps needed!

### Example Workflow

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]  # Trigger on push to main branch

jobs:
  test:
    - Run backend tests
    - Run frontend tests
    - Run E2E tests
  
  deploy:
    if: tests pass
    - Build Docker images
    - Push to AWS
    - Restart services
```

**Benefits for SwiftCart:**
- ✅ Catch bugs before they reach production
- ✅ Consistent deployments (same process every time)
- ✅ Save time (no manual deployment steps)
- ✅ Deploy multiple times per day safely

---

## 3. Hosting Platform (EC2 vs Vercel vs Alternatives)

### Option A: AWS EC2 (Traditional Server)

**EC2 (Elastic Compute Cloud)** = A virtual server in the cloud where your application runs

**Simple Analogy:** Like renting a computer in the cloud instead of buying a physical server

**What Does It Do?**
- Provides a virtual server (like a computer) in AWS's data center
- You can install your application on it
- Accessible from anywhere via the internet

**How It's Used in Your Project:**
- Launch an EC2 instance (virtual server)
- Install Docker, Node.js, etc. on it
- Deploy your SwiftCart backend and frontend
- Access it via a public IP address (e.g., `http://54.123.45.67`)

**Setup Scripts:**
```bash
# setup-ec2.sh
#!/bin/bash
# Install Docker
# Install Docker Compose
# Configure firewall
# Set up SSL certificates
# Configure environment variables
```

**Benefits:**
- ✅ Full control (install anything you need)
- ✅ Works with Socket.io (persistent connections)
- ✅ Scalable (can upgrade server size as traffic grows)
- ✅ Can run MongoDB, Redis, Elasticsearch on same server

**Drawbacks:**
- ❌ More complex setup
- ❌ You manage server updates, security patches
- ❌ Higher cost for small projects

---

### Option B: Vercel (Recommended for Frontend) ⭐

**Vercel** = Serverless hosting platform optimized for frontend frameworks

**Simple Analogy:** Like having a magic box that automatically deploys your website - you push code, it's live instantly

**What Does It Do?**
- Automatically builds and deploys your React frontend
- Provides global CDN (fast loading worldwide)
- Free SSL certificates
- Automatic deployments from GitHub
- Serverless functions for API routes

**How It's Used in Your Project:**

**✅ Perfect for Frontend:**
- Connect your `swiftcart-frontend` repository to Vercel
- Push to GitHub → Vercel automatically builds and deploys
- Your React app is live at `https://swiftcart.vercel.app`
- Free SSL, global CDN included

**⚠️ Limitations for Backend:**
- Vercel serverless functions have **10-second timeout** (free tier)
- **Socket.io doesn't work** with serverless functions (needs persistent connections)
- Your backend uses Socket.io for real-time features (order updates, notifications)

**Recommended Architecture:**

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│         Deployed on Vercel              │
│    https://swiftcart.vercel.app         │
└──────────────┬──────────────────────────┘
               │ API Calls
               │
┌──────────────▼──────────────────────────┐
│         Backend (Express + Socket.io)   │
│    Deploy on Railway/Render/Fly.io      │
│    https://api.swiftcart.com            │
│    (or keep EC2 for full control)       │
└─────────────────────────────────────────┘
```

**Benefits for SwiftCart Frontend:**
- ✅ Zero-config deployment (just connect GitHub repo)
- ✅ Automatic SSL certificates
- ✅ Global CDN (fast loading)
- ✅ Free tier is generous
- ✅ Automatic deployments on git push
- ✅ Preview deployments for pull requests

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in `swiftcart-frontend` directory
3. Connect GitHub repository
4. Done! Every push auto-deploys

---

### Option C: Railway / Render / Fly.io (Recommended for Backend)

**These platforms** = Simplified hosting for full-stack applications

**Simple Analogy:** Like Vercel, but for backend applications that need persistent connections

**What They Do:**
- Deploy your Express backend with one click
- Handle Docker automatically
- Provide databases (PostgreSQL, MongoDB, Redis)
- Auto-deploy from GitHub
- Free SSL certificates

**How It's Used in Your Project:**

**✅ Perfect for Backend:**
- Deploy `swiftcart-backend` to Railway/Render
- Works with Socket.io (persistent connections supported)
- Can connect to MongoDB Atlas, Redis Cloud
- Auto-deploys on git push

**Railway Example:**
1. Connect GitHub repo to Railway
2. Select `swiftcart-backend` folder
3. Add environment variables
4. Railway auto-detects Node.js and deploys
5. Get URL: `https://swiftcart-backend.railway.app`

**Benefits:**
- ✅ Simple deployment (easier than EC2)
- ✅ Works with Socket.io
- ✅ Auto-deploy from GitHub
- ✅ Free tier available
- ✅ Built-in monitoring

**Drawbacks:**
- ❌ Less control than EC2
- ❌ Costs scale with usage

---

### 🎯 Recommended Setup for SwiftCart

**Best of Both Worlds:**

1. **Frontend → Vercel** ⭐
   - Deploy `swiftcart-frontend` to Vercel
   - Free, fast, automatic deployments
   - Perfect for React apps

2. **Backend → Railway/Render** ⭐
   - Deploy `swiftcart-backend` to Railway or Render
   - Supports Socket.io for real-time features
   - Simpler than EC2, works great for Express apps

3. **Databases → Managed Services**
   - MongoDB Atlas (free tier available)
   - Redis Cloud or Upstash (free tier available)
   - Elasticsearch Cloud (or self-hosted)

**Alternative: Full EC2 Setup**
- If you want everything on one server
- More control, but more complexity
- Good for learning or if you need specific configurations

**Cost Comparison (Approximate):**
- **Vercel (Frontend)**: Free tier → $20/month for Pro
- **Railway (Backend)**: Free tier → $5-20/month
- **EC2**: $5-50/month depending on size
- **MongoDB Atlas**: Free tier → $9/month
- **Total**: ~$15-50/month for small-medium traffic

---

## 4. S3 Bucket Configuration

### What is AWS S3?

**S3 (Simple Storage Service)** = Cloud storage for files (like Dropbox, but for applications)

**Simple Analogy:** Like a massive hard drive in the cloud where you can store files

### What Does It Do?

- Stores files (images, documents, backups)
- Accessible via URLs
- Highly reliable (99.999999999% durability)
- Can serve static files (like your React build)

### How It's Used in Your Project

**Current Situation:**
- Product images might be stored locally: `swiftcart-backend/public/uploads/products/`
- If server crashes, images are lost
- Hard to scale (server storage is limited)

**With S3:**
- Upload product images to S3 bucket
- Get public URLs for images: `https://swiftcart-images.s3.amazonaws.com/product-123.jpg`
- Store images in S3, reference URLs in database
- Images survive server restarts/crashes

### Configuration Includes

- Create S3 bucket
- Set up permissions (who can upload/download)
- Configure CORS (allow frontend to access images)
- Set up lifecycle policies (delete old files, move to cheaper storage)

**Benefits for SwiftCart:**
- ✅ Reliable image storage (won't lose product images)
- ✅ Scalable (unlimited storage)
- ✅ Fast (served from AWS's CDN)
- ✅ Cost-effective (pay only for what you use)

**Alternative: Vercel Blob Storage**
- If using Vercel for frontend, consider Vercel Blob Storage
- Simpler setup (integrated with Vercel)
- Similar pricing and features
- Good alternative if you don't want to manage S3

---

## 5. CloudFront CDN Setup

### What is CloudFront?

**CDN (Content Delivery Network)** = A network of servers around the world that cache and serve your content

**Simple Analogy:** Like having copies of your website in multiple cities. When someone in Nairobi visits your site, they get it from a server in Nairobi (fast!), not from a server in the US (slow).

### What Does It Do?

- Caches your static files (images, CSS, JavaScript) on servers worldwide
- Serves content from the nearest server to each user
- Reduces load on your main server
- Speeds up your website globally

### How It's Used in Your Project

**Current Situation:**
- User in Kenya requests an image → Goes to your server in US → Slow (500ms)
- 1000 users request same image → Server handles all 1000 requests → Overloaded

**With CloudFront:**
- User in Kenya requests image → Gets it from CloudFront server in Kenya → Fast (50ms)
- 1000 users request same image → CloudFront serves cached copy → Your server handles 0 requests

### Setup Includes

- Create CloudFront distribution
- Point it to your S3 bucket (for images) or your EC2 server (for app)
- Configure caching rules
- Set up custom domain (e.g., `cdn.swiftcart.com`)

**Benefits for SwiftCart:**
- ✅ Faster page loads (especially for users far from your server)
- ✅ Reduced server load (CloudFront handles static files)
- ✅ Better user experience (faster = more sales)
- ✅ Handles traffic spikes (CloudFront absorbs load)

**Note: Vercel Includes CDN Automatically**
- If you deploy frontend to Vercel, CDN is included
- No need to set up CloudFront separately
- Vercel's CDN is global and optimized for React apps
- CloudFront is only needed if you use EC2 or want more control

---

## 6. Environment Variable Management

### What Are Environment Variables?

Configuration values that change between environments (development, staging, production)

**Simple Analogy:** Like settings on your phone. Same phone, different settings for work vs. personal use.

### What Does It Do?

- Stores sensitive data (API keys, database passwords) securely
- Different values for different environments:
  - **Development**: `MONGODB_URI=mongodb://localhost:27017/swiftcart`
  - **Production**: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swiftcart`

### How It's Used in Your Project

**Current Situation:**
- You have `.env` files locally
- But on production server, you need to manually set these
- Risk of accidentally committing secrets to GitHub

**With Proper Management:**
- Use AWS Systems Manager Parameter Store or AWS Secrets Manager
- Store secrets securely in AWS
- Application fetches them at startup
- No secrets in code or config files

### Example Variables for SwiftCart

```bash
# Backend (.env)
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
ELASTICSEARCH_URL=http://...

# Frontend (.env)
VITE_API_URL=https://api.swiftcart.com
VITE_SOCKET_URL=https://api.swiftcart.com
```

**Benefits for SwiftCart:**
- ✅ Secure (secrets not in code)
- ✅ Easy to update (change in AWS console, restart app)
- ✅ Different configs for dev/staging/production
- ✅ Audit trail (who changed what, when)

---

## 7. SSL Certificate Configuration

### What is SSL?

**SSL (Secure Sockets Layer)** = Encrypts data between browser and server

**Simple Analogy:** Like sending a letter in a locked box instead of a postcard. Even if someone intercepts it, they can't read it.

### What Does It Do?

- Encrypts data in transit (prevents hackers from reading your data)
- Shows the padlock icon in browser (users trust your site)
- Required for HTTPS (secure HTTP)
- Google ranks HTTPS sites higher

### How It's Used in Your Project

**Current Situation:**
- Your app runs on `http://localhost:3000` (not secure)
- In production, you need `https://swiftcart.com` (secure)
- Without SSL, browsers show "Not Secure" warning
- Payment processing requires HTTPS

**With SSL:**
- Get SSL certificate (free from Let's Encrypt via AWS Certificate Manager)
- Configure your server/load balancer to use it
- All traffic encrypted: `https://swiftcart.com`

### Configuration Includes

- Request SSL certificate from AWS Certificate Manager
- Validate domain ownership
- Configure load balancer or CloudFront to use certificate
- Set up automatic renewal (certificates expire yearly)

**Benefits for SwiftCart:**
- ✅ Secure (protects user data, payment info)
- ✅ Trust (users see padlock, trust your site)
- ✅ SEO (Google prefers HTTPS)
- ✅ Required for M-Pesa integration (payment gateways require HTTPS)

---

## 8. Deployment Scripts

### What Are Deployment Scripts?

Automated scripts that deploy your application to production

**Simple Analogy:** Like a recipe that tells a chef exactly how to cook a dish. Same result every time.

### What Does It Do?

- Automates the deployment process
- Ensures consistent deployments
- Reduces human error
- Saves time

### How It's Used in Your Project

**Current Situation:**
- Manual deployment:
  1. SSH into server
  2. Pull latest code
  3. Install dependencies
  4. Build application
  5. Restart services
  6. Check if it works
  - Easy to forget steps or make mistakes

**With Deployment Scripts:**
- Run one command: `./deploy.sh`
- Script does everything automatically:
  1. Pulls latest code
  2. Runs tests
  3. Builds application
  4. Stops old version
  5. Starts new version
  6. Health checks
  7. Rollback if something fails

### Example Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Run tests
pnpm test || exit 1

# Build
pnpm build || exit 1

# Stop old version
docker-compose down

# Start new version
docker-compose up -d

# Health check
sleep 10
curl http://localhost:3000/api/health || exit 1

echo "✅ Deployment complete!"
```

**Benefits for SwiftCart:**
- ✅ Consistent deployments (same process every time)
- ✅ Faster (automated vs. manual)
- ✅ Safer (includes rollback if something fails)
- ✅ Repeatable (anyone can deploy, not just you)

---

## 9. Monitoring Setup (CloudWatch)

### What is CloudWatch?

**AWS CloudWatch** = Monitoring and logging service for AWS resources

**Simple Analogy:** Like a dashboard in your car showing speed, fuel, engine temperature. CloudWatch shows your app's "vitals."

### What Does It Do?

- Monitors server health (CPU, memory, disk usage)
- Tracks application metrics (request count, response time, errors)
- Logs application events (errors, warnings, info)
- Sends alerts when something goes wrong

### How It's Used in Your Project

**Current Situation:**
- If your app crashes, you might not know until a user complains
- No visibility into server performance
- Hard to debug issues (no logs)

**With CloudWatch:**
- Real-time dashboard showing:
  - Server CPU usage (is it overloaded?)
  - Memory usage (is it running out?)
  - Request count (how many users?)
  - Error rate (are there bugs?)
  - Response time (is it slow?)
- Alerts when:
  - Server CPU > 80%
  - Error rate spikes
  - App goes down

### Example Metrics for SwiftCart

- **Server Metrics:**
  - CPU utilization
  - Memory usage
  - Disk space
  - Network traffic

- **Application Metrics:**
  - API request count
  - Average response time
  - Error rate (4xx, 5xx)
  - Active users (Socket.io connections)
  - Order creation rate
  - Payment success rate

**Benefits for SwiftCart:**
- ✅ Proactive (catch issues before users complain)
- ✅ Visibility (see what's happening in real-time)
- ✅ Debugging (logs help find bugs)
- ✅ Performance optimization (identify bottlenecks)

---

## 10. Error Tracking (Sentry)

### What is Sentry?

**Sentry** = Error tracking and monitoring service

**Simple Analogy:** Like a security camera that records when something goes wrong, so you can watch the replay and fix it.

### What Does It Do?

- Automatically captures errors in your application
- Sends you alerts when errors occur
- Provides detailed error information:
  - What went wrong
  - Where it happened (file, line number)
  - When it happened
  - Who it affected (user ID, session)
  - Stack trace (exact code path)

### How It's Used in Your Project

**Current Situation:**
- User encounters error → You might never know
- If you do find out, hard to reproduce
- No context (what was user doing? what data caused it?)

**With Sentry:**
- Error occurs → Sentry captures it automatically
- You get email/Slack notification immediately
- See full context:
  - User was on checkout page
  - Tried to process M-Pesa payment
  - Error: "Cannot read property 'amount' of undefined"
  - Stack trace shows exact line in `paymentService.ts`
  - User's browser, OS, device info

### Example Integration

```typescript
// Backend - src/app.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Frontend - src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

**Benefits for SwiftCart:**
- ✅ Catch errors immediately (don't wait for user reports)
- ✅ Fix bugs faster (full context provided)
- ✅ Improve user experience (fix issues before many users hit them)
- ✅ Track error trends (are errors increasing? decreasing?)

---

## 🎯 Summary: How These Work Together

### Complete Deployment Flow

#### Option 1: Vercel + Railway/Render (Recommended)

1. **You push code to GitHub**
   ↓
2. **Automatic Deployment**
   - **Frontend**: Vercel auto-deploys React app
   - **Backend**: Railway/Render auto-deploys Express app
   ↓
3. **Your App Runs**
   - Frontend: `https://swiftcart.vercel.app` (Vercel)
   - Backend: `https://api.swiftcart.railway.app` (Railway)
   - Images stored in S3 or Vercel Blob
   - SSL certificates automatic (both platforms)
   ↓
4. **Monitoring & Error Tracking**
   - Railway/Render dashboard monitors backend
   - Vercel Analytics monitors frontend
   - Sentry tracks application errors
   - You get alerts if something goes wrong

#### Option 2: EC2 (Full Control)

1. **You push code to GitHub**
   ↓
2. **GitHub Actions CI/CD Pipeline**
   - Runs tests automatically
   - Builds Docker images
   ↓
3. **Deployment Scripts**
   - Deploy to AWS EC2
   - Pull latest code
   - Restart services
   ↓
4. **Your App Runs on EC2**
   - Backend serves API
   - Frontend served via CloudFront CDN
   - Images stored in S3
   - SSL certificate ensures HTTPS
   ↓
5. **Monitoring & Error Tracking**
   - CloudWatch monitors server health
   - Sentry tracks application errors
   - You get alerts if something goes wrong

### Priority Order for Implementation

**Phase 1: Essential for Launch**
1. ✅ **Hosting Platform** (Vercel for frontend + Railway/Render for backend)
   - Simplest option: Connect GitHub repos, auto-deploys
   - Or: Docker + EC2 if you want full control
2. ✅ **Environment variable management** (security)
   - Vercel/Railway have built-in env var management
   - Or: AWS Systems Manager Parameter Store for EC2
3. ✅ **SSL certificate** (required for HTTPS)
   - Automatic with Vercel/Railway/Render
   - Or: AWS Certificate Manager for EC2
4. ✅ **S3 bucket configuration** (reliable image storage)
   - Or: Vercel Blob Storage (simpler alternative)

**Phase 2: Improve Reliability**
5. ✅ **GitHub Actions CI/CD** (automate testing)
   - Run tests before deployment
   - Optional: Auto-deploy (or use platform's auto-deploy)
6. ✅ **Deployment scripts** (if using EC2)
   - Not needed with Vercel/Railway (auto-deploy)

**Phase 3: Optimize & Monitor**
7. ✅ **CloudFront CDN** (faster page loads)
   - Vercel includes CDN automatically
   - Or: Set up CloudFront for EC2
8. ✅ **Monitoring setup** (catch issues early)
   - Railway/Render have built-in monitoring
   - Or: CloudWatch for EC2
9. ✅ **Error tracking (Sentry)** (fix bugs faster)
   - Works with any hosting platform

---

## 📚 Additional Resources

- **Docker**: https://docs.docker.com/get-started/
- **GitHub Actions**: https://docs.github.com/en/actions
- **AWS EC2**: https://aws.amazon.com/ec2/getting-started/
- **AWS S3**: https://aws.amazon.com/s3/getting-started/
- **CloudFront**: https://aws.amazon.com/cloudfront/getting-started/
- **Sentry**: https://docs.sentry.io/

---

## ❓ Common Questions

**Q: Do I need all of these?**  
A: For MVP launch, you need hosting (Vercel + Railway), environment variables, SSL (automatic), and image storage (S3 or Vercel Blob). The others improve reliability and performance.

**Q: Can I use Vercel for everything?**  
A: Vercel is perfect for your React frontend. For your backend with Socket.io, use Railway, Render, or Fly.io (they support persistent connections). Vercel serverless functions don't work with Socket.io.

**Q: How much does this cost?**  
A: 
- **Vercel**: Free tier → $20/month Pro
- **Railway/Render**: Free tier → $5-20/month
- **EC2**: $5-50/month
- **Total (Vercel + Railway)**: ~$15-40/month for small-medium traffic
- **Total (EC2)**: ~$20-60/month

**Q: Is this hard to set up?**  
A: **Vercel + Railway is easiest**: Just connect GitHub repos, add env vars, done! **EC2 is more complex** but gives you full control. Start with Vercel + Railway, then consider EC2 if you need more control.

**Q: What about Socket.io on Vercel?**  
A: Socket.io requires persistent WebSocket connections, which don't work with Vercel's serverless functions. Deploy your backend to Railway, Render, or Fly.io instead. They support Socket.io perfectly.

**Q: Do I still need Docker with Vercel/Railway?**  
A: **No!** Vercel and Railway auto-detect your stack and build it. Docker is optional (you can use it if you want, but not required). Docker is more important if you use EC2.

---

**Last Updated:** December 2024  
**Status:** Ready for Implementation

