import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin: env.NODE_ENV === 'production' 
      ? env.FRONTEND_URL 
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 200, message: 'API is running', version: env.API_VERSION });
});

// Products route - dynamically import controller to avoid blocking compilation
app.get('/api/v1/products', async (req, res, next) => {
  try {
    const { getProducts } = await import('./controllers/products.controller');
    return getProducts(req, res, next);
  } catch (error: any) {
    logger.error('Failed to load products controller:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

// Product by slug route
app.get('/api/v1/products/:slug', async (req, res, next) => {
  try {
    const { getProductBySlug } = await import('./controllers/products.controller');
    return getProductBySlug(req, res, next);
  } catch (error: any) {
    logger.error('Failed to load products controller:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load product' });
  }
});

// Load routes dynamically to avoid blocking compilation
// Routes are loaded on first request, then cached
const routeCache: Record<string, any> = {};

const loadRoute = async (routePath: string, routeFile: string) => {
  if (!routeCache[routePath]) {
    try {
      const routeModule = await import(routeFile);
      routeCache[routePath] = routeModule.default;
      logger.info(`Route loaded: ${routePath}`);
    } catch (error: any) {
      logger.error(`Failed to load route ${routePath}:`, error.message);
      throw error;
    }
  }
  return routeCache[routePath];
};

// Async middleware wrapper for Express - properly handles async
const asyncRouteLoader = (routePath: string, routeFile: string) => {
  return (req: any, res: any, next: any) => {
    loadRoute(routePath, routeFile)
      .then((router) => {
        router(req, res, next);
      })
      .catch((error: any) => {
        logger.error(`Error loading route ${routePath}:`, error.message);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: `Failed to load ${routePath} routes` });
        }
      });
  };
};

// Auth routes - dynamically import to avoid blocking
app.use('/api/v1/auth', asyncRouteLoader('auth', './routes/auth.routes'));

// Orders routes - dynamically import to avoid blocking
app.use('/api/v1/orders', asyncRouteLoader('orders', './routes/orders.routes'));

// Payment routes - dynamically import to avoid blocking
app.use('/api/v1/payment', asyncRouteLoader('payment', './routes/payment.routes'));

// Admin routes - dynamically import to avoid blocking
app.use('/api/v1/admin', asyncRouteLoader('admin', './routes/admin.routes'));

// Deals routes - dynamically import to avoid blocking
app.use('/api/v1/deals', asyncRouteLoader('deals', './routes/deals.routes'));

// Search routes - dynamically import to avoid blocking
app.use('/api/v1/search', asyncRouteLoader('search', './routes/search.routes'));

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
