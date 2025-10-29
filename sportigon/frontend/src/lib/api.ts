import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export const sportsApi = {
  getAll: async () => {
    const response = await apiClient.get('/sports');
    return response.data;
  },

  getLiveScores: async () => {
    const response = await apiClient.get('/sports/live-scores');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/sports/${id}`);
    return response.data;
  },
};

export const feedApi = {
  getPosts: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/feed', { params: { page, limit } });
    return response.data;
  },

  createPost: async (content: string) => {
    const response = await apiClient.post('/feed', { content });
    return response.data;
  },

  likePost: async (postId: string) => {
    const response = await apiClient.post(`/feed/${postId}/like`);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await apiClient.delete(`/feed/${postId}`);
    return response.data;
  },
};

export const usersApi = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/users', { params: { page, limit } });
    return response.data;
  },

  getByUsername: async (username: string) => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
};
