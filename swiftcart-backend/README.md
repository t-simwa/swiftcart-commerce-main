# SwiftCart Backend API

Backend API server for the SwiftCart E-Commerce Platform built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT tokens
- `JWT_REFRESH_SECRET` - A secure random string for refresh tokens
- `FRONTEND_URL` - Your frontend URL (default: http://localhost:8080)

3. **Start MongoDB:**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Use the connection string from your Atlas dashboard

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Route controllers
│   │   └── products.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # Mongoose models
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   ├── Transaction.ts
│   │   └── Inventory.ts
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   └── products.routes.ts
│   ├── scripts/         # Utility scripts
│   │   └── seed.ts      # Database seeding
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Products
- `GET /api/v1/products` - Get all products (with filtering, sorting, pagination)
  - Query params: `page`, `limit`, `category`, `search`, `sort`, `minPrice`, `maxPrice`, `featured`
- `GET /api/v1/products/:slug` - Get single product by slug

### Example Requests

```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Get products with filters
curl "http://localhost:3000/api/v1/products?category=Electronics&sort=price-asc&page=1&limit=10"

# Get single product
curl http://localhost:3000/api/v1/products/premium-wireless-headphones
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample products
- `npm run lint` - Run ESLint

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on all endpoints
- Strict rate limiting on auth endpoints
- Input validation
- Error handling middleware

## 📊 Database Models

### Product
- Product information, pricing, images, stock levels

### User
- User accounts with authentication, roles (customer/admin)

### Order
- Customer orders with items, shipping address, status

### Transaction
- Payment transactions (M-Pesa, cards, etc.)

### Inventory
- Stock tracking with history and low stock alerts

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens

**Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## 🚧 Coming Soon

- Authentication endpoints (register, login, refresh token)
- Cart management endpoints
- Checkout and order creation
- M-Pesa payment integration
- Admin dashboard endpoints
- Real-time features with Socket.io
- Redis caching
- Elasticsearch integration

## 📝 Notes

- The API uses RESTful conventions
- All responses follow a consistent format
- Error responses include status codes and error messages
- Pagination is available on list endpoints
- Text search uses MongoDB text indexes

## 🐛 Troubleshooting

**MongoDB connection issues:**
- Ensure MongoDB is running
- Check your connection string in `.env`
- Verify network access if using MongoDB Atlas

**Port already in use:**
- Change `PORT` in `.env` or kill the process using port 3000

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

