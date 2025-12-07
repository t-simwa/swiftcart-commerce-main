const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: any[];
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthApiClient {
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

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        // If response is not JSON, create a generic error
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (!response.ok) {
        // Log the full error response for debugging
        console.error('Backend Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        
        // Safely extract error message, avoiding any stack traces or code references
        let errorMessage = `Request failed with status ${response.status}`;
        
        // Handle validation errors with details
        if (data?.details && Array.isArray(data.details)) {
          // Format validation errors nicely
          const validationErrors = data.details
            .map((detail: any) => {
              if (typeof detail === 'string') return detail;
              if (detail?.message) return `${detail.path || 'Field'}: ${detail.message}`;
              return null;
            })
            .filter(Boolean)
            .join(', ');
          
          if (validationErrors) {
            errorMessage = validationErrors;
          }
        }
        
        // Only use the message field, never the stack trace
        if (data?.message && typeof data.message === 'string') {
          // Clean the message - remove any potential code references
          const cleanMsg = data.message
            .replace(/require\s*\(/gi, '') // Remove require() calls
            .replace(/at\s+.*require.*/gi, '') // Remove require stack traces
            .replace(/at\s+.*\n/gi, '') // Remove all stack trace lines
            .trim();
          
          if (cleanMsg && cleanMsg.length > 0) {
            errorMessage = cleanMsg;
          }
        } else if (data?.error && typeof data.error === 'string') {
          const cleanErr = data.error
            .replace(/require\s*\(/gi, '')
            .replace(/at\s+.*require.*/gi, '')
            .replace(/at\s+.*\n/gi, '')
            .trim();
          
          if (cleanErr && cleanErr.length > 0) {
            errorMessage = cleanErr;
          }
        }
        
        // Never include stack trace in error message
        // Stack traces contain Node.js require() calls that break in browser
        
        // If message is empty after cleaning, use default
        if (!errorMessage || errorMessage.length === 0) {
          errorMessage = `Request failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      // Log full error details for debugging
      console.error('API Error Details:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        response: error?.response,
      });
      
      // Try to extract more details from the error
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message
          .replace(/require\s*\(/gi, '')
          .replace(/at\s+.*require.*/gi, '')
          .trim() || 'An unexpected error occurred';
      } else if (error?.message) {
        errorMessage = String(error.message)
          .replace(/require\s*\(/gi, '')
          .replace(/at\s+.*require.*/gi, '')
          .trim() || 'An unexpected error occurred';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request<{ user: User; tokens: AuthTokens }>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request<{ user: User; tokens: AuthTokens }>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    return this.request<{ tokens: AuthTokens }>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Get current user
   */
  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/v1/auth/me');
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/auth/verify-email/${token}`);
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Change password (authenticated users)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export const authApi = new AuthApiClient(API_BASE_URL);

