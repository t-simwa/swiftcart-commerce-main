/**
 * Compatibility hooks for gradual migration from Context API to Redux
 * These hooks provide the same interface as the old Context API hooks
 * but use Redux under the hood
 */
import { useAppDispatch, useAppSelector } from '../hooks';
import { setAuth, updateUser, updateTokens, logout, setLoading } from '../slices/authSlice';
import { useRegisterMutation, useLoginMutation, useLogoutMutation, useRefreshTokenMutation, useGetMeQuery } from '../api/apiSlice';
import { RegisterData, LoginData } from '@/lib/authApi';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redux-based auth hook that matches the Context API interface
 */
export function useAuthRedux() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  
  const [registerMutation] = useRegisterMutation();
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const { data: meData, refetch: refetchMe } = useGetMeQuery(undefined, {
    skip: !authState.isAuthenticated,
  });

  // Sync user data from RTK Query
  useEffect(() => {
    if (meData?.data?.user && authState.isAuthenticated) {
      dispatch(updateUser(meData.data.user));
    }
  }, [meData, authState.isAuthenticated, dispatch]);

  const register = async (data: RegisterData) => {
    try {
      dispatch(setLoading(true));
      const response = await registerMutation(data).unwrap();
      if (response.data) {
        const { user, tokens } = response.data;
        dispatch(setAuth({ user, tokens }));
        toast({
          title: 'Registration successful',
          description: response.message || 'Welcome to SwiftCart!',
        });
        navigate('/');
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during registration';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (data: LoginData) => {
    try {
      dispatch(setLoading(true));
      const response = await loginMutation(data).unwrap();
      if (response.data) {
        const { user, tokens } = response.data;
        dispatch(setAuth({ user, tokens }));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${user.firstName || user.email}!`,
        });
        navigate('/');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Invalid email or password';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutHandler = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutMutation(refreshToken).unwrap();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await refreshTokenMutation(refreshToken).unwrap();
      if (response.data?.tokens) {
        dispatch(updateTokens(response.data.tokens));
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      dispatch(logout());
      throw error;
    }
  };

  const updateUserHandler = (user: typeof authState.user) => {
    if (user) {
      dispatch(updateUser(user));
    }
  };

  return {
    ...authState,
    register,
    login,
    logout: logoutHandler,
    refreshAccessToken,
    updateUser: updateUserHandler,
  };
}

