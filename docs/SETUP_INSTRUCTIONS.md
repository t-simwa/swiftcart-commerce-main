# SwiftCart E-Commerce Platform - Setup Instructions

## 🎯 Overview

This guide will help you set up both the frontend and backend of the SwiftCart E-Commerce Platform.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **MongoDB** installed locally OR a **MongoDB Atlas** account (free tier works)
- **Git** (if cloning the repository)
- A code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Install Frontend Dependencies

```bash
# Navigate to project root
cd swiftcart-commerce-main

# Install dependencies
npm install
```

### Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd swiftcart-backend

# Install backend dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `swiftcart-backend/.env` and set the following:

```env
# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/swiftcart

# For MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swiftcart

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Server Port
PORT=3000
```

**Generate secure JWT secrets:**
```bash
# On Linux/Mac:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows (PowerShell):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Set Up MongoDB

#### Option A: Local MongoDB

1. **Install MongoDB:**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB:**
   ```bash
   # Windows
   mongod

   # Mac/Linux
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/data
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string and update `MONGODB_URI` in `.env`

### Step 5: Seed the Database

```bash
# From backend directory
cd backend
npm run seed
```

This will populate your database with sample products.

### Step 6: Start the Backend Server

```bash
# From backend directory
npm run dev
```

The backend API will start on `http://localhost:3000`

Verify it's working:
```bash
curl http://localhost:3000/api/health
```

### Step 7: Configure Frontend API URL

Create a `.env` file in the frontend folder:

```bash
# From project root
cd swiftcart-frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
cd ..
```

Or manually create `swiftcart-frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Step 8: Start the Frontend Development Server

```bash
# From project root
npm run dev:frontend
```

The frontend will start on `http://localhost:8080`

## ✅ Verification

1. **Backend Health Check:**
   - Open: http://localhost:3000/api/health
   - Should return: `{"success":true,"status":200,"message":"API is running"}`

2. **Backend Products API:**
   - Open: http://localhost:3000/api/v1/products
   - Should return a list of products

3. **Frontend:**
   - Open: http://localhost:8080
   - You should see the homepage
   - Navigate to Products page - products should load from the API

## 🐛 Troubleshooting

### Backend Issues

**"MongoDB connection failed"**
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas: Verify IP whitelist and credentials

**"Port 3000 already in use"**
- Change `PORT` in `swiftcart-backend/.env`
- Or kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

**"Module not found" errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Frontend Issues

**"Failed to fetch" or CORS errors**
- Ensure backend is running
- Check `FRONTEND_URL` in `swiftcart-backend/.env` matches your frontend URL
- Verify `VITE_API_URL` in `swiftcart-frontend/.env`

**Products not loading**
- Check browser console for errors
- Verify backend API is accessible: http://localhost:3000/api/v1/products
- Check network tab in browser dev tools

### Database Issues

**"Database seed failed"**
- Ensure MongoDB is running and accessible
- Check connection string in `.env`
- Try connecting with MongoDB Compass or `mongosh`

## 📚 Next Steps

Once everything is set up:

1. ✅ Backend API is running
2. ✅ Database is seeded with products
3. ✅ Frontend is connected to backend
4. 🚧 **Next:** Implement authentication system
5. 🚧 **Next:** Add checkout and payment integration
6. 🚧 **Next:** Build admin dashboard

## 🔗 Useful Links

- Backend API Docs: See `swiftcart-backend/README.md`
- API Health: http://localhost:3000/api/health
- Frontend: http://localhost:8080
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

## 📝 Development Workflow

1. **Start MongoDB** (if using local)
2. **Start Backend:** `npm run dev:backend` (from root)
3. **Start Frontend:** `npm run dev:frontend` (from root)
4. **Or start both:** `npm run dev` (from root)
4. **Make changes** - both servers auto-reload
5. **Test API:** Use browser or Postman/Insomnia

## 🎉 You're All Set!

Your development environment is ready. Start building features!

