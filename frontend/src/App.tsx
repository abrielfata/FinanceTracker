import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuthStore } from './store/useAuthStore';
import api from './lib/axios';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Lazy-loaded Pages for performance code-splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transaksi = lazy(() => import('./pages/Transaksi'));
const Budget = lazy(() => import('./pages/Budget'));
const Tagihan = lazy(() => import('./pages/Tagihan'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));
const SavingGoals = lazy(() => import('./pages/SavingGoals'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-body-sm font-medium text-on-surface-variant">Memuat...</p>
      </div>
    </div>
  );
}

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
            <img 
              src="/logo.png" 
              alt="Logo FiTrack" 
              width="56"
              height="56"
              className="w-14 h-14 object-contain animate-pulse" 
            />
          </div>
          <span className="font-headline text-2xl font-bold text-on-surface tracking-tight">FiTrack</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayoutWrapper />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transaksi" element={<Transaksi />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/tagihan" element={<Tagihan />} />
              <Route path="/tabungan" element={<SavingGoals />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
