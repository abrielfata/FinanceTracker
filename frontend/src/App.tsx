import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import api from './lib/axios';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Budget from './pages/Budget';
import Tagihan from './pages/Tagihan';
import Pengaturan from './pages/Pengaturan';

function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function App() {
  const { setAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // On app startup, attempt a silent token refresh via httpOnly cookie.
    // If no cookie exists (user never logged in), this will 401 and we proceed to login.
    const initAuth = async () => {
      try {
        // Step 1: refresh → get new access token
        const refreshRes = await api.post('/auth/refresh');
        const accessToken: string = refreshRes.data.accessToken;

        // Step 2: fetch user profile with the new token
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Step 3: persist in Zustand store
        setAuth(meRes.data.user, accessToken);
      } catch {
        // No valid refresh cookie — user is not logged in, that's fine
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-premium-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-[4px] border-primary/10"></div>
            <div className="absolute inset-0 rounded-full border-[4px] border-primary border-t-transparent animate-spin"></div>
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain animate-pulse" />
          </div>
          <span className="font-headline text-2xl font-bold text-on-surface tracking-tight">FiTrack</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayoutWrapper />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transaksi" element={<Transaksi />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/tagihan" element={<Tagihan />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
