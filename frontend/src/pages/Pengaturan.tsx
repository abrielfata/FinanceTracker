import React, { useState } from 'react';
import Header from '../components/layout/Header';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Pengaturan() {
  const { user, setAuth, logout, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [nama, setNama] = useState(user?.nama || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { nama });
      setAuth(res.data.user, accessToken!);
      toast.success('Profil berhasil diperbarui!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    try {
      await api.put('/auth/password', { oldPassword, newPassword });
      toast.success('Password berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <>
      <Header title="Pengaturan Akun" />
      <main className="px-xl pt-lg pb-xxl max-w-[1280px] mx-auto animate-fade-in">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Profile Section */}
          <div className="md:col-span-8 space-y-gutter">
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-lg border border-premium-border shadow-premium">
              <h3 className="font-headline text-headline-md text-on-surface mb-6">Profil Saya</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-premium-charcoal text-white flex items-center justify-center font-bold text-headline-lg shrink-0 shadow-sm">
                  {user?.nama?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h4 className="font-body text-headline-md font-bold text-on-surface leading-tight mb-1">{user?.nama}</h4>
                  <p className="font-body text-body-md text-on-surface-variant">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={nama} 
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-primary focus:border-primary transition-colors bg-white text-on-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-body-md bg-surface-container-low text-on-surface-variant cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-on-surface-variant">Email tidak dapat diubah saat ini.</p>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile || nama === user?.nama}
                    className="py-3 px-6 rounded-xl text-body-md font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-lg border border-premium-border shadow-premium">
              <h3 className="font-headline text-headline-md text-on-surface mb-6">Ganti Password</h3>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Password Lama</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-primary focus:border-primary transition-colors bg-white text-on-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Password Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl text-body-md focus:outline-none focus:ring-primary focus:border-primary transition-colors bg-white text-on-surface"
                    minLength={8}
                    required
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword || !oldPassword || !newPassword}
                    className="py-3 px-6 rounded-xl text-body-md font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="md:col-span-4">
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-lg border border-error-container shadow-premium">
              <h3 className="font-headline text-headline-md text-error mb-4">Zona Berbahaya</h3>
              <p className="font-body text-body-sm text-on-surface-variant mb-6">
                Keluar dari akun aplikasi FiTrack. Pastikan semua pekerjaanmu sudah tersimpan.
              </p>
              
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-error text-error hover:bg-error hover:text-white rounded-xl font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Keluar Akun
              </button>
            </div>
          </div>

        </div>
      </main>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar Akun"
        message="Yakin ingin keluar dari akun aplikasi FiTrack?"
        confirmText="Keluar"
      />
    </>
  );
}
