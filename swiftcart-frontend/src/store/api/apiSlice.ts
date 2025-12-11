import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = (getState() as RootState).auth.tokens?.accessToken;
      
      // Or fallback to localStorage if not in state yet
      if (!token) {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          headers.set('authorization', `Bearer ${storedToken}`);
        }
      } else {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Products', 'Order', 'Orders', 'User', 'Deals'],
  endpoints: (builder) => ({
    // Products endpoints
    getProducts: builder.query<any, {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      sort?: string;
      minPrice?: number;
      maxPrice?: number;
      featured?: boolean;
      brands?: string;
    }>({
      query: (params) => ({
        url: '/v1/products',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProductBySlug: builder.query<any, string>({
      query: (slug) => `/v1/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),
    
    // Search endpoints
    search: builder.query<any, {
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      featured?: boolean;
      brands?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/v1/search',
        params,
      }),
      providesTags: ['Products'],
    }),
    getSearchSuggestions: builder.query<any, { q?: string; limit?: number }>({
      query: (params) => ({
        url: '/v1/search/suggestions',
        params,
      }),
    }),
    
    // Deals endpoints
    getDeals: builder.query<any, {
      page?: number;
      limit?: number;
      category?: string;
      brands?: string;
      minDiscount?: number;
      maxDiscount?: number;
      minPrice?: number;
      maxPrice?: number;
      dealType?: string;
      premiumExclusive?: boolean;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/v1/deals',
        params,
      }),
      providesTags: ['Deals'],
    }),
    
    // Orders endpoints
    getOrders: builder.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: '/v1/orders',
        params,
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<any, string>({
      query: (orderId) => `/v1/orders/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    createOrder: builder.mutation<any, {
      items: Array<{ productId: string; quantity: number }>;
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      notes?: string;
    }>({
      query: (body) => ({
        url: '/v1/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
    cancelOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/v1/orders/${orderId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Orders', 'Order'],
    }),
    
    // Auth endpoints
    register: builder.mutation<any, {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }>({
      query: (body) => ({
        url: '/v1/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/v1/auth/login',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<any, string>({
      query: (refreshToken) => ({
        url: '/v1/auth/logout',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    refreshToken: builder.mutation<any, string>({
      query: (refreshToken) => ({
        url: '/v1/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    getMe: builder.query<any, void>({
      query: () => '/v1/auth/me',
      providesTags: ['User'],
    }),
    
    // Payment endpoints
    initiatePayment: builder.mutation<any, {
      orderId: string;
      gateway?: 'mpesa' | 'card' | 'bank';
      phoneNumber?: string;
    }>({
      query: (body) => ({
        url: '/v1/payment/initiate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Orders'],
    }),
    getTransactionStatus: builder.query<any, string>({
      query: (transactionId) => `/v1/payment/transaction/${transactionId}`,
    }),
    getOrderPaymentStatus: builder.query<any, string>({
      query: (orderId) => `/v1/payment/order/${orderId}/status`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useSearchQuery,
  useGetSearchSuggestionsQuery,
  useGetDealsQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useInitiatePaymentMutation,
  useGetTransactionStatusQuery,
  useGetOrderPaymentStatusQuery,
} = api;

