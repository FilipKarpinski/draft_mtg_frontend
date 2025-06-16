import { useContext, useEffect } from 'react';
import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { authApi } from './api';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const useAxiosInterceptors = (): void => {
  const { accessToken, refreshAccessToken, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = authApi.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    const responseInterceptor = authApi.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      async (error: any) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Check if this is a failed refresh token request
        const isRefreshRequest = originalRequest.url?.includes('/refresh');
        // Check if this is a login request
        const isLoginRequest = originalRequest.url?.includes('/login');
        // Check if this is a register request
        const isRegisterRequest =
          originalRequest.url?.includes('/users') && originalRequest.method === 'post';

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isRefreshRequest &&
          !isLoginRequest &&
          !isRegisterRequest
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            const newRequest = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              },
              // Remove the retry flag to avoid infinite loops
              _retry: undefined,
            };
            // Retry the original request with the new token
            const retryResponse = await authApi(newRequest);
            return retryResponse;
          } catch (refreshError) {
            await logout();
            navigate('/login');
            return Promise.reject(refreshError);
          }
        }

        // If we get here, either it's not a 401 or we've already tried to refresh
        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(requestInterceptor);
      authApi.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshAccessToken, logout]);
};

export default useAxiosInterceptors;
