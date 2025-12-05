const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiClient {
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
      ...options,
    };

    // Add auth token if available
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
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<PaginatedResponse<any>>(
      `/v1/products${queryString ? `?${queryString}` : ''}`
    );
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<{ product: any }>> {
    return this.request<{ product: any }>(`/v1/products/${slug}`);
  }

  // Orders
  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    notes?: string;
  }): Promise<ApiResponse<{ order: any }>> {
    return this.request<{ order: any }>('/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ orders: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{ orders: any[]; pagination: any }>(
      `/v1/orders${queryString ? `?${queryString}` : ''}`
    );
  }

  async getOrderById(orderId: string): Promise<ApiResponse<{ order: any }>> {
    return this.request<{ order: any }>(`/v1/orders/${orderId}`);
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<{ order: any }>> {
    return this.request<{ order: any }>(`/v1/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
  }

  // Payment
  async initiatePayment(data: {
    orderId: string;
    gateway?: 'mpesa' | 'card' | 'bank';
    phoneNumber?: string;
  }): Promise<ApiResponse<{ transaction: any; stkPush: any; message: string }>> {
    return this.request<{ transaction: any; stkPush: any; message: string }>(
      '/v1/payment/initiate',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getTransactionStatus(
    transactionId: string
  ): Promise<ApiResponse<{ transaction: any; order: any }>> {
    return this.request<{ transaction: any; order: any }>(
      `/v1/payment/transaction/${transactionId}`
    );
  }

  async getOrderPaymentStatus(
    orderId: string
  ): Promise<ApiResponse<{ order: any; transactions: any[]; latestTransaction: any }>> {
    return this.request<{ order: any; transactions: any[]; latestTransaction: any }>(
      `/v1/payment/order/${orderId}/status`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

