import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/lib/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
}

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (accessToken && refreshToken && savedUser) {
      return {
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false,
        tokens: { accessToken, refreshToken },
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    tokens: null,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, action.payload.tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.tokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    updateTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setLoading, setAuth, updateUser, updateTokens, logout } = authSlice.actions;
export default authSlice.reducer;

