import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../lib/axios';

interface NotificationItem {
  id: string;
  type: 'warning' | 'error';
  title: string;
  message: string;
  link: string;
}

type TabType = 'all' | 'tagihan' | 'budget';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    fetchNotifications();

    const handleRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('fitrack:refresh-notifications', handleRefresh);

    return () => {
      window.removeEventListener('fitrack:refresh-notifications', handleRefresh);
    };
  }, []);

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const hasUnread = notifications.length > 0;

  // Filter tab kategori
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'tagihan') return item.link.includes('/tagihan');
    if (activeTab === 'budget') return item.link.includes('/budget');
    return true;
  });

  const tagihanCount = notifications.filter(i => i.link.includes('/tagihan')).length;
  const budgetCount = notifications.filter(i => i.link.includes('/budget')).length;

  return (
    <>
      {/* Tombol Lonceng di Header */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 rounded-full border border-premium-border bg-white flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        aria-label="Buka Notifikasi"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {hasUnread && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Slide-over Drawer via React Portal ke document.body */}
      {createPortal(
        <div 
          className={`fixed inset-0 z-[9999] transition-visibility duration-300 ${
            isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
          }`}
        >
          {/* Backdrop gelap blur */}
          <div 
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Panel Drawer Kanan */}
          <div 
            className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface-container-lowest border-l border-premium-border shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header Drawer */}
            <div className="p-5 border-b border-premium-border/60 flex items-center justify-between shrink-0 bg-surface-container-lowest">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">Pusat Notifikasi</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Kondisi & pengingat keuangan</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <span className="text-[11px] font-semibold bg-error/10 text-error px-2.5 py-0.5 rounded-full border border-error/20">
                    {notifications.length} Aktif
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs (Kategori) */}
            <div className="px-5 pt-3 pb-2 border-b border-premium-border/40 flex items-center gap-2 bg-surface-container-low/40">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/80'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tagihan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tagihan'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/80'
                }`}
              >
                Tagihan
                {tagihanCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === 'tagihan' ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface'
                  }`}>
                    {tagihanCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('budget')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'budget'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/80'
                }`}
              >
                Budget
                {budgetCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === 'budget' ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface'
                  }`}>
                    {budgetCount}
                  </span>
                )}
              </button>
            </div>

            {/* Konten Notifikasi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high/40 flex items-center justify-center text-on-surface-variant/40 mb-3 border border-premium-border/50">
                    <span className="material-symbols-outlined text-[32px]">task_alt</span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface">Tidak Ada Notifikasi</h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-[240px] leading-relaxed">
                    Semua tagihan dan pengeluaran kamu berada dalam status aman & terkendali! 🎉
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isError = notif.type === 'error';
                  const isTagihan = notif.link.includes('/tagihan');

                  return (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isError 
                          ? 'bg-error-container/10 border-error/20 hover:border-error/40' 
                          : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          isError 
                            ? 'bg-error text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {isTagihan ? 'event_busy' : 'account_balance_wallet'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isError ? 'bg-error/10 text-error' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {isError ? 'Penting' : 'Peringatan'}
                            </span>
                            <span className="text-[11px] text-on-surface-variant/70">
                              {isTagihan ? 'Jatuh Tempo' : 'Batas Limit'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-on-surface mt-1.5 leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Tombol aksi cepat */}
                          <div className="mt-3 pt-2.5 border-t border-dashed border-premium-border/60 flex items-center justify-end">
                            <Link
                              to={notif.link}
                              onClick={() => setIsOpen(false)}
                              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                isError
                                  ? 'bg-error/10 text-error hover:bg-error hover:text-white'
                                  : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white'
                              }`}
                            >
                              <span>{isTagihan ? 'Cek Tagihan' : 'Atur Budget'}</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Drawer */}
            <div className="p-3 border-t border-premium-border/60 text-center bg-surface-container-low/30">
              <p className="text-[11px] text-on-surface-variant/70">
                FiTrack Intelligence Notifikasi Otomatis
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
