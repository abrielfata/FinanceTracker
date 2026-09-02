import { create } from 'zustand';

interface User {
  id: string;
  nama: string;
  email: string;
  siklusTgl?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
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

  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null
    })),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
