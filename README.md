# SwiftCart E-Commerce Platform

A full-stack e-commerce platform built with React, TypeScript, Node.js, Express, and MongoDB.

## 📁 Project Structure

```
swiftcart-commerce-main/
├── swiftcart-frontend/    # React + TypeScript frontend application
│   ├── src/              # Frontend source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── swiftcart-backend/     # Node.js + Express backend API
│   ├── src/              # Backend source code
│   └── package.json      # Backend dependencies
│
└── README.md             # This file
```

## 🚀 Quick Start

### Option 1: Docker (Recommended for Easy Setup)

**Prerequisites:**
- Docker Desktop installed and running

**Steps:**

1. **Clone the repository** (if not already done)

2. **Copy environment variables:**
   ```bash
   cp docker/env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Seed the database:**
   ```bash
   docker-compose exec backend pnpm seed
   ```

5. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api/v1
   - Health Check: http://localhost:3000/api/health

**See [docker/README.md](docker/README.md) for detailed Docker instructions.**

---

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- pnpm 8+ (install with `npm install -g pnpm`)
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for caching)
- Elasticsearch (optional, for search)

**Steps:**

1. **Clone the repository** (if not already done)

2. **Install all dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure backend:**
   ```bash
   cd swiftcart-backend
   # Create .env file with your configuration
   # See docker/env.example for reference
   ```

4. **Configure frontend:**
   ```bash
   cd swiftcart-frontend
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

5. **Seed the database:**
   ```bash
   pnpm seed
   ```

6. **Start both servers:**
   ```bash
   pnpm dev
   ```
   This starts both backend (port 3000) and frontend (port 8080) simultaneously.

   **Or start individually:**
   ```bash
   # Terminal 1 - Backend only
   pnpm dev:backend

   # Terminal 2 - Frontend only
   pnpm dev:frontend
   ```

7. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api/v1
   - Health Check: http://localhost:3000/api/health

## 📚 Documentation

- **Deployment Guide:** See `docs/DEPLOYMENT_GUIDE.md` 🚀 ⭐
- **Docker Setup:** See `docker/README.md`
- **DevOps Guide:** See `docs/DEVOPS_GUIDE.md`
- **Setup Instructions:** See `docs/SETUP_INSTRUCTIONS.md`
- **Quick Start:** See `docs/QUICK_START.md`
- **Gap Analysis:** See `docs/PROJECT_GAP_ANALYSIS.md`
- **Backend API:** See `swiftcart-backend/README.md`

## 🛠️ Development

### Run Both Servers

```bash
pnpm dev              # Start both backend and frontend
```

### Individual Commands

**Backend:**
```bash
pnpm dev:backend      # Start backend only
pnpm build:backend    # Build backend
pnpm seed             # Seed database
```

**Frontend:**
```bash
pnpm dev:frontend     # Start frontend only
pnpm build:frontend   # Build frontend
pnpm lint             # Lint frontend code
```

**Build Everything:**
```bash
pnpm build            # Build both backend and frontend
```

### Advanced

```bash
pnpm install          # Install all dependencies
pnpm clean            # Clean all node_modules and dist folders
```

## 🔧 Environment Variables

### Backend (`swiftcart-backend/.env`)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/swiftcart
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:8080
```

### Frontend (`swiftcart-frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- React Router

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Helmet (Security)
- CORS

## 🚧 Current Status

- ✅ Backend API server
- ✅ MongoDB database models
- ✅ Product API endpoints
- ✅ Frontend connected to backend
- ✅ Product listing and detail pages
- 🚧 Authentication (in progress)
- 🚧 Checkout flow (planned)
- 🚧 M-Pesa integration (planned)
- 🚧 Admin dashboard (planned)

## 📝 License

ISC
