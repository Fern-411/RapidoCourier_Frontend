import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { type ApiResponse, type AuthResponse } from '@/lib/axios';

/* ── Tipos del Store ── */
interface User {
  email: string;
  rol: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithGitHub: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      errorCode: null,

  /* ── Login con Email & Password ── */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });

      if (data.success && data.data) {
        set({
          user: { email: data.data.email, rol: data.data.rol },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: data.error?.message || data.message || 'Error al iniciar sesión',
        });
      }
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      let errCode = null;
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.error?.code) {
          errCode = response.data.error.code;
        }
      }
      set({ isLoading: false, error: errorMessage, errorCode: errCode });
    }
  },

  /* ── Login con Google (ID Token) ── */
  loginWithGoogle: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/oauth2/google', {
        token: idToken,
      });

      if (data.success && data.data) {
        set({
          user: { email: data.data.email, rol: data.data.rol },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: data.error?.message || 'Error al iniciar sesión con Google',
        });
      }
    } catch (err: unknown) {
      set({ isLoading: false, error: extractErrorMessage(err) });
    }
  },

  /* ── Login con GitHub (Authorization Code) ── */
  loginWithGitHub: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/oauth2/github', {
        token: code,
      });

      if (data.success && data.data) {
        set({
          user: { email: data.data.email, rol: data.data.rol },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: data.error?.message || 'Error al iniciar sesión con GitHub',
        });
      }
    } catch (err: unknown) {
      set({ isLoading: false, error: extractErrorMessage(err) });
    }
  },

  /* ── Logout ── */
  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Incluso si falla el endpoint, limpiamos el estado local
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null, errorCode: null }),

  setUser: (user: User | null) =>
    set({ user, isAuthenticated: user !== null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

/* ── Helper para extraer mensajes de error ── */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: ApiResponse<unknown> } }).response;
    if (response?.data?.error?.message) {
      return response.data.error.message;
    }
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return 'Error de conexión. Verifica que el servidor esté disponible.';
}
