# Search & Performance Setup Guide - Windows

## ⚠️ Docker Not Installed?

If you're getting `docker: command not found`, you have **3 options**:

---

## Option 1: Install Docker (Recommended for Production)

### Install Docker Desktop for Windows

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"
   - Install and restart your computer

2. **Start Docker Desktop:**
   - Launch Docker Desktop from Start Menu
   - Wait for it to start (whale icon in system tray)

3. **Verify Installation:**
   ```bash
   docker --version
   docker ps
   ```

4. **Then run the setup commands:**
   ```bash
   docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
   docker run -d -p 6379:6379 redis:7-alpine
   ```

---

## Option 2: Skip Docker (App Works Without It!)

**Good news:** The application is designed to work **without** Elasticsearch and Redis!

### What happens without them:
- ✅ **Backend works** - Uses MongoDB text search instead of Elasticsearch
- ✅ **Frontend works** - All features functional
- ⚠️ **No caching** - Slightly slower, but still works
- ⚠️ **Basic search** - MongoDB text search instead of advanced Elasticsearch search

### Just start the app:

**Terminal 1 - Backend:**
```bash
cd swiftcart-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd swiftcart-frontend
npm run dev
```

**That's it!** The app will:
- Show warnings in logs about Elasticsearch/Redis not available
- Continue working normally
- Use MongoDB for search (still functional!)

---

## Option 3: Install Services Manually (Advanced)

### Install Elasticsearch Manually

1. **Download Elasticsearch:**
   - Visit: https://www.elastic.co/downloads/elasticsearch
   - Download Windows ZIP
   - Extract to `C:\elasticsearch`

2. **Run Elasticsearch:**
   ```bash
   cd C:\elasticsearch\bin
   elasticsearch.bat
   ```

3. **Verify:**
   - Open browser: http://localhost:9200
   - Should see JSON response

### Install Redis Manually

1. **Download Redis for Windows:**
   - Option A: Use WSL2 (Windows Subsystem for Linux)
   - Option B: Use Memurai (Redis-compatible for Windows)
     - Download: https://www.memurai.com/
     - Install and start service

2. **Or use Redis via WSL2:**
   ```bash
   wsl
   sudo apt update
   sudo apt install redis-server
   redis-server
   ```

---

## Recommended: Option 2 (Skip Docker for Now)

**For development/testing, you can skip Docker entirely!**

The application is designed with **graceful degradation**:
- If Elasticsearch is unavailable → Uses MongoDB text search ✅
- If Redis is unavailable → No caching, but still works ✅

### Quick Start (No Docker Needed):

**Terminal 1:**
```bash
cd swiftcart-backend
npm run dev
```

**Terminal 2:**
```bash
cd swiftcart-frontend
npm run dev
```

**Check the logs:**
- You'll see: `⚠️ Elasticsearch not available - application will continue with MongoDB text search`
- You'll see: `⚠️ Redis not available - application will continue without caching`
- **This is normal and expected!** The app still works.

---

## Verify Everything Works

### 1. Check Backend Health:
```bash
curl http://localhost:3000/api/health
```

### 2. Test Search (uses MongoDB if Elasticsearch unavailable):
```bash
curl "http://localhost:3000/api/v1/search?q=laptop"
```

### 3. Test Products:
```bash
curl "http://localhost:3000/api/v1/products?page=1&limit=5"
```

### 4. Open Frontend:
- Browser: http://localhost:8080
- Search should work (using MongoDB text search)

---

## When to Install Docker?

**Install Docker if you want:**
- ✅ Advanced search features (fuzzy matching, better relevance)
- ✅ Faster response times (Redis caching)
- ✅ Production-like environment
- ✅ Better performance with large datasets

**Skip Docker if you want:**
- ✅ Quick development setup
- ✅ Test basic functionality
- ✅ Avoid installation complexity
- ✅ Still have working search (MongoDB text search)

---

## Summary

**For now, just run:**
```bash
# Terminal 1
cd swiftcart-backend
npm run dev

# Terminal 2  
cd swiftcart-frontend
npm run dev
```

**The app will work!** You can add Docker later when you need the advanced features.

---

## Need Help?

- **Docker installation issues?** → Use Option 2 (skip Docker)
- **Backend won't start?** → Check MongoDB is running
- **Frontend won't start?** → Check port 8080 is available
- **Search not working?** → Check backend logs for MongoDB connection



