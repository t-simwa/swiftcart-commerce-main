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

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Clone the repository** (if not already done)

2. **Install all dependencies:**

   ```bash
   npm run install:all
   ```

   Or install individually:
   ```bash
   npm install                           # Root dependencies
   npm install --prefix swiftcart-backend   # Backend dependencies
   npm install --prefix swiftcart-frontend  # Frontend dependencies
   ```

3. **Configure backend:**

   ```bash
   cd swiftcart-backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secrets
   ```

4. **Configure frontend:**

   ```bash
   cd swiftcart-frontend
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

5. **Seed the database:**

   ```bash
   npm run seed
   ```

6. **Start both servers (recommended):**

   ```bash
   npm run dev
   ```

   This starts both backend (port 3000) and frontend (port 8080) simultaneously.

   **Or start individually:**

   ```bash
   # Terminal 1 - Backend only
   npm run dev:backend

   # Terminal 2 - Frontend only
   npm run dev:frontend
   ```

7. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api/v1
   - Health Check: http://localhost:3000/api/health

## 📚 Documentation

- **Setup Instructions:** See `SETUP_INSTRUCTIONS.md`
- **Quick Start:** See `QUICK_START.md`
- **Gap Analysis:** See `PROJECT_GAP_ANALYSIS.md`
- **Backend API:** See `swiftcart-backend/README.md`

## 🛠️ Development

### Run Both Servers

```bash
npm run dev              # Start both backend and frontend
```

### Individual Commands

**Backend:**
```bash
npm run dev:backend      # Start backend only
npm run build:backend    # Build backend
npm run seed             # Seed database
```

**Frontend:**
```bash
npm run dev:frontend     # Start frontend only
npm run build:frontend   # Build frontend
npm run lint             # Lint frontend code
```

**Build Everything:**
```bash
npm run build            # Build both backend and frontend
```

### Advanced

```bash
npm run install:all      # Install all dependencies
npm run clean            # Clean all node_modules and dist folders
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
