import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        nama: data.nama,
        email: data.email,
        password: data.password,
      });
      setAuth(response.data.user, response.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-base flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-premium-charcoal text-amber-400 font-bold text-xl shadow-lg mb-2">
            FT
          </div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">FiTrack</h1>
          <p className="font-body text-sm text-on-surface-variant">Buat akun baru untuk mulai kelola keuanganmu</p>
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
              <label htmlFor="nama" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                {...register('nama')}
                id="nama"
                type="text"
                placeholder="Nama Lengkap"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.nama ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all`}
              />
              {errors.nama && (
                <p className="mt-1.5 text-xs font-medium text-error">{errors.nama.message}</p>
              )}
            </div>

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
                placeholder="Minimal 8 karakter"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.password ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Konfirmasi Password
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.confirmPassword ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all`}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-error">{errors.confirmPassword.message}</p>
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
                  'Daftar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-premium-border/60 text-center">
            <p className="text-sm text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline transition-colors ml-1"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
