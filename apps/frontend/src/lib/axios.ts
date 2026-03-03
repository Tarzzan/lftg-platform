import axios from 'axios';
import { useAuthStore } from '@/lib/auth-store';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Lecture dynamique du token depuis le store Zustand au moment de la requête
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
