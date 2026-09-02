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
      const response = await api.post('/auth/login', data);
      setAuth(response.data.user, response.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-base flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-3 mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">FiTrack</h1>
          </div>
        <h2 className="mt-6 text-center text-headline-md text-on-surface">Masuk ke akun Anda</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-4 shadow-premium sm:rounded-2xl sm:px-10 border border-premium-border">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant">
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-error' : 'border-outline-variant'
                  } rounded-lg shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white transition-colors`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-error' : 'border-outline-variant'
                  } rounded-lg shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white transition-colors`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-body-md font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-premium-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">
                  Belum punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
