import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, setAccessToken } from './auth';

const baseURL = (import.meta.env.VITE_API_URL as string) || '/api';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryableRequestConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, undefined, {
          withCredentials: true,
        });
        const tokens = refreshResponse.data;
        setAccessToken(tokens.accessToken);
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
