# Deployment Quick Reference

**Quick commands and URLs for SwiftCart deployment**

---

## 🚀 Quick Deploy Commands

### Backend (Render)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Render dashboard and create service
# - Connect GitHub repo
# - Root Directory: swiftcart-backend
# - Build: pnpm install && pnpm build
# - Start: pnpm start
```

### Frontend (Vercel)

```bash
# 1. Push code to GitHub (same as above)

# 2. Go to Vercel dashboard and import project
# - Root Directory: swiftcart-frontend
# - Framework: Vite (auto-detected)
# - Build: pnpm build
# - Output: dist
```

---

## 🔑 Environment Variables Checklist

### Backend (Render)

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
FRONTEND_URL=https://your-app.vercel.app
REDIS_HOST=<upstash-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<upstash-redis-password>
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🔗 URL Structure

```
Frontend:  https://swiftcart.vercel.app
Backend:   https://swiftcart-backend.onrender.com
API:       https://swiftcart-backend.onrender.com/api/v1
Health:    https://swiftcart-backend.onrender.com/api/health
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: Visit `https://your-app.vercel.app`
- [ ] API connection: Check browser console for API calls
- [ ] CORS working: No CORS errors in browser console
- [ ] Socket.io: Test real-time features (if using)

---

## 🐛 Common Issues

**Backend won't start:**
- Check PORT is set to 10000
- Verify MongoDB connection string
- Check Render logs

**Frontend can't connect:**
- Verify VITE_API_URL includes `/api`
- Check CORS settings in backend
- Ensure FRONTEND_URL matches Vercel URL exactly

**CORS errors:**
- Backend FRONTEND_URL must match Vercel URL exactly
- No trailing slashes
- Include protocol (https://)

---

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

