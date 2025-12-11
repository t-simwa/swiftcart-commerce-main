import request from 'supertest';
import app from '../../app';
import { Order } from '../../models/Order';
import { Product } from '../../models/Product';
import { User } from '../../models/User';

describe('Orders API Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testUser: any;
  let testProduct: any;
  let testOrder: any;

  beforeEach(async () => {
    // Clean up
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create user
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'Test',
      });
    authToken = userResponse.body.data.tokens.accessToken;
    testUser = userResponse.body.data.user;

    // Create admin
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

    // Create product
    testProduct = new Product({
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 99.99,
      category: 'electronics',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    });
    await testProduct.save();
  });

  describe('POST /api/v1/orders', () => {
    it('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            productId: testProduct._id.toString(),
            name: testProduct.name,
            price: testProduct.price,
            quantity: 2,
            sku: testProduct.sku || 'SKU001',
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'mpesa',
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.items.length).toBe(1);
      expect(response.body.data.order.totalAmount).toBe(testProduct.price * 2);
    });

    it('should fail without authentication', async () => {
      const orderData = {
        items: [
          {
            productId: testProduct._id.toString(),
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      // Create test order
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            productId: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1,
            sku: testProduct.sku || 'SKU001',
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        totalAmount: testProduct.price,
        status: 'pending',
      });
      await testOrder.save();
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/orders (Admin Only)', () => {
    beforeEach(async () => {
      // Create test order
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            productId: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1,
            sku: testProduct.sku || 'SKU001',
          },
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        totalAmount: testProduct.price,
        status: 'pending',
      });
      await testOrder.save();
    });

    it('should get all orders as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should fail for non-admin user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

