import request from 'supertest';
import app from '../../app';
import { Product } from '../../models/Product';
import { User } from '../../models/User';

describe('Products API Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testProduct: any;

  beforeEach(async () => {
    // Clean up
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create regular user
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'Test',
      });
    authToken = userResponse.body.data.tokens.accessToken;

    // Create admin user
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'admin',
      isEmailVerified: true,
    });
    await adminUser.save();

    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
    adminToken = adminLoginResponse.body.data.tokens.accessToken;

    // Create test product
    testProduct = new Product({
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 99.99,
      category: 'electronics',
      stock: 10,
      images: ['https://example.com/image.jpg'],
      featured: true,
    });
    await testProduct.save();
  });

  describe('GET /api/v1/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.category.toLowerCase()).toContain('electronics');
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/v1/products?minPrice=50&maxPrice=150')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(50);
        expect(product.price).toBeLessThanOrEqual(150);
      });
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeLessThanOrEqual(5);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/v1/products?sort=price-asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.products.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  describe('GET /api/v1/products/:slug', () => {
    it('should get product by slug', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProduct.slug}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.slug).toBe(testProduct.slug);
      expect(response.body.data.product.name).toBe(testProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/non-existent-product')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/admin/products (Admin Only)', () => {
    it('should create product as admin', async () => {
      const productData = {
        name: 'New Product',
        description: 'New product description',
        price: 199.99,
        category: 'electronics',
        stock: 20,
        images: ['https://example.com/new-image.jpg'],
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(productData.name);
    });

    it('should fail for non-admin user', async () => {
      const productData = {
        name: 'New Product',
        description: 'New product description',
        price: 199.99,
        category: 'electronics',
        stock: 20,
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

