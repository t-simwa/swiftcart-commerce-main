# Docker Setup for SwiftCart

This directory contains Docker configuration files for containerizing and running the SwiftCart e-commerce platform.

## 📋 Files Overview

- `docker-compose.yml` - Production setup with all services
- `docker-compose.dev.yml` - Development setup (databases only, for local dev)
- `swiftcart-backend/Dockerfile` - Backend container configuration
- `swiftcart-frontend/Dockerfile` - Frontend container configuration
- `swiftcart-frontend/nginx.conf` - Nginx configuration for frontend

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2 (included with Docker Desktop)

### Option 1: Full Stack (Production-like)

Run everything in containers:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

**Services will be available at:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api/v1
- MongoDB: localhost:27017
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200

### Option 2: Development Mode (Databases Only)

Run only databases in containers, run app locally:

```bash
# Start only databases
docker-compose -f docker-compose.dev.yml up -d

# Run backend locally (in another terminal)
cd swiftcart-backend
pnpm dev

# Run frontend locally (in another terminal)
cd swiftcart-frontend
pnpm dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with your configuration:

```bash
# Backend
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
MONGODB_URI=mongodb://mongodb:27017/swiftcart
REDIS_HOST=redis
REDIS_PORT=6379
ELASTICSEARCH_NODE=http://elasticsearch:9200

# M-Pesa (if using)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Frontend
VITE_API_URL=http://localhost:3000/api
```

**Note:** For production, use Docker secrets or environment variable management tools.

### Updating Environment Variables

After changing `.env` file:

```bash
# Rebuild containers
docker-compose up -d --build
```

## 📦 Building Images

### Build individual services:

```bash
# Build backend
docker build -t swiftcart-backend ./swiftcart-backend

# Build frontend
docker build -t swiftcart-frontend ./swiftcart-frontend
```

### Build all services:

```bash
docker-compose build
```

## 🛠️ Common Commands

### View running containers:

```bash
docker-compose ps
```

### View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Execute commands in containers:

```bash
# Backend shell
docker-compose exec backend sh

# MongoDB shell
docker-compose exec mongodb mongosh

# Redis CLI
docker-compose exec redis redis-cli
```

### Restart a service:

```bash
docker-compose restart backend
```

### Rebuild and restart:

```bash
docker-compose up -d --build backend
```

## 🗄️ Database Management

### Seed the database:

```bash
# Run seed script in backend container
docker-compose exec backend pnpm seed
```

### Backup MongoDB:

```bash
docker-compose exec mongodb mongodump --out /data/backup
```

### Restore MongoDB:

```bash
docker-compose exec mongodb mongorestore /data/backup
```

## 🧹 Cleanup

### Stop and remove containers:

```bash
docker-compose down
```

### Remove containers, networks, and volumes:

```bash
docker-compose down -v
```

### Remove all images:

```bash
docker-compose down --rmi all
```

### Clean up unused Docker resources:

```bash
docker system prune -a
```

## 🐛 Troubleshooting

### Port already in use:

If ports 3000, 8080, 27017, 6379, or 9200 are already in use:

1. Stop the conflicting service, or
2. Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change host port
   ```

### Container won't start:

Check logs:
```bash
docker-compose logs backend
```

### Database connection issues:

Ensure services are healthy:
```bash
docker-compose ps
```

Wait for databases to be ready (they have health checks).

### Frontend can't connect to backend:

1. Check backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Verify `VITE_API_URL` in frontend environment

### Out of memory (Elasticsearch):

Reduce Elasticsearch memory in `docker-compose.yml`:
```yaml
environment:
  - "ES_JAVA_OPTS=-Xms256m -Xmx256m"
```

## 📊 Health Checks

All services include health checks. Check status:

```bash
docker-compose ps
```

Healthy services show `(healthy)` status.

## 🔒 Security Notes

- Never commit `.env` files to git
- Use Docker secrets for production
- Keep images updated: `docker-compose pull`
- Review security headers in `nginx.conf`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [SwiftCart DevOps Guide](../docs/DEVOPS_GUIDE.md)

