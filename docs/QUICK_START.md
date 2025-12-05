# 🚀 Quick Start Guide

Get your SwiftCart E-Commerce Platform running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed? Run: `node --version`
- ✅ MongoDB installed or Atlas account ready?

## Setup Steps

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
npm install --prefix swiftcart-backend
```

### 2. Configure Backend

```bash
cd swiftcart-backend

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/swiftcart
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
FRONTEND_URL=http://localhost:8080
EOF

cd ..
```

**Or manually create `swiftcart-backend/.env` with:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/swiftcart
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
FRONTEND_URL=http://localhost:8080
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (update MONGODB_URI in .env)

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Servers

**Start both at once (recommended):**
```bash
npm run dev
```

**Or individually:**

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 6. Verify

- ✅ Backend: http://localhost:3000/api/health
- ✅ Frontend: http://localhost:8080
- ✅ Products API: http://localhost:3000/api/v1/products

## 🎉 Done!

Your e-commerce platform is now running!

**Next Steps:**
- See `SETUP_INSTRUCTIONS.md` for detailed setup
- See `PROJECT_GAP_ANALYSIS.md` for what's next to implement

