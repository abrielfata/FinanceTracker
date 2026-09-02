import { create } from 'zustand';

interface User {
  id: string;
  nama: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true }),

  setAccessToken: (token) =>
    set({ accessToken: token }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
