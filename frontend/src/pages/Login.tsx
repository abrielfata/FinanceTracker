import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        ...data,
        email: data.email.trim(),
      });
      setAuth(response.data.user, response.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-base flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="FiTrack Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2 drop-shadow-md"
          />
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">FiTrack</h1>
          <p className="font-body text-sm text-on-surface-variant">Masuk ke akun Anda untuk mengelola keuangan</p>
        </div>

        {/* Card Form */}
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-10 rounded-3xl shadow-premium border border-premium-border/80">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error-container/80 text-on-error-container px-4 py-3 rounded-xl text-sm font-medium border border-error/20 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="nama@email.com"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                placeholder="••••••••"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.password ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-error">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-premium-border/60 text-center">
            <p className="text-sm text-on-surface-variant">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline transition-colors ml-1"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
