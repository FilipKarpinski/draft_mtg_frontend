import { useContext, useEffect } from "react";
import { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { authApi } from "./api";
import { AuthContext } from "./AuthContext";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const useAxiosInterceptors = (): void => {
  const { accessToken, refreshAccessToken, logout } = useContext(AuthContext);

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

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            authApi.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return authApi(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

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
