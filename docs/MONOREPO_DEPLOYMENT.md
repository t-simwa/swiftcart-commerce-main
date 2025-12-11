# Monorepo Deployment Guide

**Deploying SwiftCart monorepo to Vercel (Frontend) + Render (Backend)**

---

## ✅ Yes, It Works!

Both **Vercel** and **Render** support monorepos. You can use the **same GitHub repository** for both deployments.

---

## 📁 Your Repository Structure

```
swiftcart-commerce-main/          ← Root of your monorepo
├── swiftcart-frontend/          ← Vercel will build this
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── swiftcart-backend/           ← Render will build this
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Deployment Steps

### Step 1: Push Your Monorepo to GitHub

```bash
# From the root directory
git add .
git commit -m "Ready for deployment"
git push origin main
```

**One repository, two deployments!** 🎉

---

### Step 2: Deploy Backend to Render

1. **Go to Render Dashboard** → New → Web Service
2. **Connect your GitHub repository** (the monorepo)
3. **Configure:**
   - **Name:** `swiftcart-backend`
   - **Root Directory:** `swiftcart-backend` ⚠️ **This is the key!**
   - **Runtime:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
4. **Add environment variables** (see deployment guide)
5. **Deploy!**

**What Render does:**
- Pulls your entire repo
- Only looks at `swiftcart-backend/` folder (because of Root Directory)
- Runs build commands in that folder
- Deploys your backend

---

### Step 3: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard** → Add New Project
2. **Import your GitHub repository** (the same monorepo)
3. **Configure:**
   - **Root Directory:** `swiftcart-frontend` ⚠️ **This is the key!**
   - **Framework Preset:** `Vite` (auto-detected)
   - **Build Command:** `pnpm build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
4. **Add environment variable:**
   - `VITE_API_URL=https://your-backend.onrender.com/api`
5. **Deploy!**

**What Vercel does:**
- Pulls your entire repo
- Only looks at `swiftcart-frontend/` folder (because of Root Directory)
- Runs build commands in that folder
- Deploys your frontend

---

## 🔄 How It Works

### Same Repo, Different Folders

```
GitHub Repo (swiftcart-commerce-main)
    │
    ├─── Vercel ────────→ swiftcart-frontend/  (builds React app)
    │
    └─── Render ────────→ swiftcart-backend/   (builds Express API)
```

**Key Points:**
- ✅ One GitHub repository
- ✅ Two separate deployments
- ✅ Each platform only sees its folder
- ✅ Both auto-deploy on git push
- ✅ Independent scaling and configuration

---

## 🎯 Benefits of Monorepo Deployment

1. **Single Source of Truth**
   - All code in one place
   - Easier to manage versions
   - Consistent commits

2. **Simplified Workflow**
   - One `git push` updates both frontend and backend
   - Shared types/interfaces stay in sync
   - Easier code reviews

3. **Cost Effective**
   - One GitHub repository
   - No need to split repos

---

## ⚙️ Configuration Examples

### Render Configuration

```yaml
# render.yaml (optional - can also configure in dashboard)
services:
  - type: web
    name: swiftcart-backend
    rootDir: swiftcart-backend  # ← Monorepo root directory
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
```

### Vercel Configuration

```json
// vercel.json (already created in your repo)
{
  "buildCommand": "cd swiftcart-frontend && pnpm install && pnpm build",
  "outputDirectory": "swiftcart-frontend/dist",
  "installCommand": "cd swiftcart-frontend && pnpm install",
  "rootDirectory": "swiftcart-frontend"  // ← Monorepo root directory
}
```

---

## 🔄 Auto-Deployment

**Both platforms auto-deploy on git push:**

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Both Vercel and Render automatically:
# 1. Detect the push
# 2. Pull latest code
# 3. Build their respective folders
# 4. Deploy
```

**Deployment happens in parallel:**
- Vercel builds frontend (~2-3 minutes)
- Render builds backend (~3-5 minutes)
- Both go live independently

---

## 🐛 Troubleshooting

### Issue: Render can't find package.json

**Solution:** Make sure **Root Directory** is set to `swiftcart-backend` (not root)

### Issue: Vercel can't find vite.config.ts

**Solution:** Make sure **Root Directory** is set to `swiftcart-frontend` (not root)

### Issue: Build commands fail

**Solution:** 
- Check that `pnpm` is available (both platforms support it)
- Verify build commands work locally first
- Check build logs in platform dashboards

### Issue: Environment variables not working

**Solution:**
- Frontend: Use `VITE_` prefix (Vite requirement)
- Backend: No prefix needed
- Set in each platform's dashboard separately

---

## 📊 Deployment Flow

```
1. You push to GitHub
   ↓
2. GitHub webhook triggers both platforms
   ↓
3. Vercel: Builds swiftcart-frontend/
   Render: Builds swiftcart-backend/
   ↓
4. Both deploy independently
   ↓
5. Frontend: https://your-app.vercel.app
   Backend: https://your-backend.onrender.com
```

---

## ✅ Checklist

- [ ] Monorepo pushed to GitHub
- [ ] Render configured with Root Directory: `swiftcart-backend`
- [ ] Vercel configured with Root Directory: `swiftcart-frontend`
- [ ] Environment variables set in both platforms
- [ ] Backend URL updated in Vercel env vars
- [ ] Frontend URL updated in Render env vars
- [ ] Both deployments successful
- [ ] Test frontend → backend connection

---

## 🎉 You're All Set!

Your monorepo is now deployed to both platforms. Every `git push` will automatically update both frontend and backend!

---

**See also:**
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)

