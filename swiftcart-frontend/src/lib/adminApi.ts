const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  variants?: any[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
    totalOrdersCount: number;
  };
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  lowStockProducts: number;
  lowStockProductsList: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
  }>;
}

export interface Inventory {
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    category: string;
    price: number;
    image: string;
  }>;
  stats: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStockValue: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Add auth token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error: any) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  // Orders
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ orders: Order[]; pagination: any }>(
      `/v1/admin/orders${queryString ? `?${queryString}` : ''}`
    );
  }

  async getOrderById(orderId: string): Promise<ApiResponse<{ order: Order }>> {
    return this.request<{ order: Order }>(`/v1/admin/orders/${orderId}`);
  }

  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<{ order: Order }>> {
    return this.request<{ order: Order }>(`/v1/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Products
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }): Promise<ApiResponse<{ products: Product[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ products: Product[]; pagination: any }>(
      `/v1/admin/products${queryString ? `?${queryString}` : ''}`
    );
  }

  async createProduct(productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> {
    return this.request<{ product: Product }>('/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(
    productId: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<{ product: Product }>> {
    return this.request<{ product: Product }>(`/v1/admin/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ analytics: Analytics }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ analytics: Analytics }>(
      `/v1/admin/analytics${queryString ? `?${queryString}` : ''}`
    );
  }

  // Users
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: 'customer' | 'admin';
    search?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ users: User[]; pagination: any }>(
      `/v1/admin/users${queryString ? `?${queryString}` : ''}`
    );
  }

  async updateUserRole(
    userId: string,
    role: 'customer' | 'admin'
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Inventory
  async getInventory(params?: {
    page?: number;
    limit?: number;
    lowStockOnly?: boolean;
  }): Promise<ApiResponse<{ inventory: Inventory }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ inventory: Inventory }>(
      `/v1/admin/inventory${queryString ? `?${queryString}` : ''}`
    );
  }
}

export const adminApi = new AdminApiClient(API_BASE_URL);

