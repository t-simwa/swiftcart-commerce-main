# Search & Performance Setup Guide

## ⚠️ Docker Not Installed?

If you see `docker: command not found`, see **[SEARCH_PERFORMANCE_SETUP_WINDOWS.md](./SEARCH_PERFORMANCE_SETUP_WINDOWS.md)** for Windows-specific instructions.

**Quick answer:** You can skip Docker! The app works without it (uses MongoDB search instead of Elasticsearch).

---

## Quick Setup Commands by Directory

### 1. Elasticsearch Setup (Optional - Run from ANY directory)

Elasticsearch runs as a separate service, so you can run this from anywhere:

```bash
# Option 1: Using Docker (Recommended)
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0

# Option 2: Using Docker Compose (if you have docker-compose.yml)
docker-compose up -d elasticsearch
```

**Location:** Can run from project root or any directory

---

### 2. Redis Setup (Optional - Run from ANY directory)

Redis also runs as a separate service:

```bash
# Option 1: Using Docker (Recommended)
docker run -d -p 6379:6379 redis:7-alpine

# Option 2: Using Docker Compose (if you have docker-compose.yml)
docker-compose up -d redis
```

**Location:** Can run from project root or any directory

---

### 3. Backend Setup & Start

**Navigate to backend directory first:**

```bash
# From project root
cd swiftcart-backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev
```

**Location:** Must run from `swiftcart-backend/` directory

---

### 4. Frontend Setup & Start

**Navigate to frontend directory first:**

```bash
# From project root
cd swiftcart-frontend

# Install dependencies (if not already done)
npm install

# Start the frontend dev server
npm run dev
```

**Location:** Must run from `swiftcart-frontend/` directory

---

### 5. Testing Commands

#### Test Search Endpoint (from ANY directory)

```bash
# Basic search
curl "http://localhost:3000/api/v1/search?q=laptop"

# Search with filters
curl "http://localhost:3000/api/v1/search?q=phone&category=electronics&minPrice=100&maxPrice=1000&sort=price-asc"
```

**Location:** Can run from any directory (uses HTTP endpoint)

#### Test Products Endpoint (from ANY directory)

```bash
# Get products
curl "http://localhost:3000/api/v1/products?page=1&limit=20"

# Get product by slug
curl "http://localhost:3000/api/v1/products/your-product-slug"
```

**Location:** Can run from any directory (uses HTTP endpoint)

---

## Complete Setup Workflow

### Step 1: Start Services (from project root or any directory)

```bash
# Start Elasticsearch (optional)
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0

# Start Redis (optional)
docker run -d -p 6379:6379 redis:7-alpine
```

### Step 2: Start Backend (from swiftcart-backend/)

```bash
cd swiftcart-backend
npm install  # Only needed first time
npm run dev
```

### Step 3: Start Frontend (from swiftcart-frontend/)

```bash
# Open a new terminal
cd swiftcart-frontend
npm install  # Only needed first time
npm run dev
```

### Step 4: Verify Setup

1. **Check Backend:** http://localhost:3000/api/health
2. **Check Frontend:** http://localhost:8080
3. **Check Elasticsearch:** http://localhost:9200 (should return JSON)
4. **Check Redis:** `docker exec -it <redis-container-id> redis-cli ping` (should return "PONG")

---

## Environment Variables

### Backend Environment (.env in swiftcart-backend/)

```env
# MongoDB (Required)
MONGODB_URI=mongodb://localhost:27017/swiftcart

# Elasticsearch (Optional - defaults to localhost:9200)
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# Redis (Optional - defaults to localhost:6379)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (Required)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
```

**Location:** Create `.env` file in `swiftcart-backend/` directory

---

## Directory Structure Reference

```
swiftcart-commerce-main/
├── swiftcart-backend/          ← Run backend commands here
│   ├── src/
│   ├── package.json
│   └── .env                    ← Backend environment variables
│
├── swiftcart-frontend/         ← Run frontend commands here
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── docs/                       ← Documentation (read-only)
```

---

## Common Commands Summary

| Command | Directory | Purpose |
|---------|-----------|---------|
| `docker run ... elasticsearch` | Any | Start Elasticsearch service |
| `docker run ... redis` | Any | Start Redis service |
| `npm install` | `swiftcart-backend/` | Install backend dependencies |
| `npm run dev` | `swiftcart-backend/` | Start backend server |
| `npm install` | `swiftcart-frontend/` | Install frontend dependencies |
| `npm run dev` | `swiftcart-frontend/` | Start frontend dev server |
| `curl http://localhost:3000/...` | Any | Test API endpoints |

---

## Troubleshooting

### Backend won't start
- **Check:** Are you in `swiftcart-backend/` directory?
- **Check:** Is MongoDB running?
- **Check:** Are dependencies installed? (`npm install`)

### Frontend won't start
- **Check:** Are you in `swiftcart-frontend/` directory?
- **Check:** Are dependencies installed? (`npm install`)
- **Check:** Is port 8080 available?

### Elasticsearch connection failed
- **Check:** Is Elasticsearch running? (`docker ps`)
- **Check:** Can you access http://localhost:9200?
- **Note:** Backend will continue without Elasticsearch (uses MongoDB fallback)

### Redis connection failed
- **Check:** Is Redis running? (`docker ps`)
- **Check:** Can you access Redis? (`docker exec -it <container> redis-cli ping`)
- **Note:** Backend will continue without Redis (no caching, but still functional)

---

## Quick Start (All in One)

If you want to start everything quickly:

```bash
# Terminal 1: Start services
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Start backend
cd swiftcart-backend
npm run dev

# Terminal 3: Start frontend
cd swiftcart-frontend
npm run dev
```

That's it! 🚀

