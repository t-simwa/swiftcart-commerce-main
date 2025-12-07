import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, User, AuthTokens, RegisterData, LoginData } from '@/lib/authApi';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
}

interface AuthContextType extends AuthState {
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    tokens: null,
  });
  const navigate = useNavigate();

  // Load user and tokens from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const accessToken = localStorage.getItem(TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (accessToken && refreshToken && savedUser) {
          const user = JSON.parse(savedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            tokens: { accessToken, refreshToken },
          });

          // Verify token is still valid by fetching current user
          try {
            const response = await authApi.getMe();
            if (response.data?.user) {
              setState((prev) => ({
                ...prev,
                user: response.data!.user,
                isLoading: false,
              }));
              localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }
          } catch (error) {
            // Token invalid, try to refresh
            try {
              await refreshAccessToken();
            } catch (refreshError) {
              // Refresh failed, clear auth state
              clearAuthState();
            }
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const clearAuthState = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tokens: null,
    });
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      if (response.data?.tokens) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        setState((prev) => ({
          ...prev,
          tokens: { accessToken, refreshToken: newRefreshToken },
        }));
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      clearAuthState();
      throw error;
    }
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      if (response.data) {
        const { user, tokens } = response.data;
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          tokens,
        });
        toast({
          title: 'Registration successful',
          description: response.message || 'Welcome to SwiftCart!',
        });
        navigate('/');
      }
    } catch (error: any) {
      // Extract error message safely, cleaning any problematic content
      let errorMessage = 'An error occurred during registration';
      
      if (error instanceof Error) {
        errorMessage = error.message
          .replace(/require\s*\(/gi, '') // Remove require() calls
          .replace(/at\s+.*require.*/gi, '') // Remove require stack traces
          .trim();
      } else if (typeof error === 'string') {
        errorMessage = error
          .replace(/require\s*\(/gi, '')
          .replace(/at\s+.*require.*/gi, '')
          .trim();
      } else if (error?.message) {
        errorMessage = String(error.message)
          .replace(/require\s*\(/gi, '')
          .replace(/at\s+.*require.*/gi, '')
          .trim();
      }
      
      // If message is empty after cleaning, use default
      if (!errorMessage || errorMessage.length === 0) {
        errorMessage = 'An error occurred during registration';
      }
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw new Error(errorMessage);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      if (response.data) {
        const { user, tokens } = response.data;
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          tokens,
        });
        toast({
          title: 'Login successful',
          description: `Welcome back, ${user.firstName || user.email}!`,
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/');
    }
  };

  const updateUser = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        refreshAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

