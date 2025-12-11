import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

interface ProductsState {
  selectedProduct: Product | null;
  recentlyViewed: Product[];
  favorites: string[]; // Array of product IDs
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    sort?: string;
  };
}

const initialState: ProductsState = {
  selectedProduct: null,
  recentlyViewed: [],
  favorites: [],
  filters: {},
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
      
      // Add to recently viewed
      if (action.payload) {
        const productId = action.payload._id || action.payload.id || action.payload.slug;
        const existingIndex = state.recentlyViewed.findIndex(
          (p) => (p._id || p.id || p.slug) === productId
        );
        
        if (existingIndex >= 0) {
          // Remove from current position
          state.recentlyViewed.splice(existingIndex, 1);
        }
        
        // Add to beginning (most recent)
        state.recentlyViewed.unshift(action.payload);
        
        // Keep only last 20
        if (state.recentlyViewed.length > 20) {
          state.recentlyViewed = state.recentlyViewed.slice(0, 20);
        }
      }
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((id) => id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<ProductsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setSelectedProduct,
  addToFavorites,
  removeFromFavorites,
  setFilters,
  clearFilters,
} = productsSlice.actions;

// Selectors
export const selectSelectedProduct = (state: { products: ProductsState }) =>
  state.products.selectedProduct;
export const selectRecentlyViewed = (state: { products: ProductsState }) =>
  state.products.recentlyViewed;
export const selectFavorites = (state: { products: ProductsState }) => state.products.favorites;
export const selectFilters = (state: { products: ProductsState }) => state.products.filters;

export default productsSlice.reducer;

