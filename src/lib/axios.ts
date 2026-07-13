import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

/* En desarrollo, Next.js hace proxy de /api/v1/* → http://localhost:8080/api/v1/*
   Esto evita problemas de CORS y permite que las cookies httpOnly se envíen correctamente. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ← Crítico: permite enviar/recibir cookies httpOnly del Gateway
});

/* ── Interceptor de Respuesta ── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 y no es un retry, intentamos refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // El refresh token se envía automáticamente via cookies httpOnly
        await api.post('/auth/refresh', {});
        // Si el refresh fue exitoso, las nuevas cookies ya se setearon → reintentar
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiamos el estado local y redirigimos al login
        useAuthStore.getState().setUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/* ── Tipos de Respuesta del API ── */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: {
    code: string;
    message: string;
    correlationId?: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  rol: string;
}
