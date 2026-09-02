import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

interface NotificationItem {
  id: string;
  type: 'warning' | 'error';
  title: string;
  message: string;
  link: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const hasUnread = notifications.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full border border-premium-border bg-white flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="material-symbols-outlined">notifications</span>
        {hasUnread && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-premium border border-premium-border overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-premium-border flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-bold text-headline-sm text-on-surface">Notifikasi</h3>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
              {notifications.length} Baru
            </span>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">done_all</span>
                <p className="text-body-sm text-on-surface-variant">Belum ada notifikasi baru</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Kondisi keuanganmu aman terkendali! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-premium-border/50">
                {notifications.map((notif) => (
                  <Link 
                    key={notif.id} 
                    to={notif.link}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-4 p-4 hover:bg-surface-container-lowest transition-colors cursor-pointer group"
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.type === 'error' ? 'bg-error/10 text-error' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <span className="material-symbols-outlined text-xl">
                        {notif.type === 'error' ? 'warning' : 'info'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors">{notif.title}</p>
                      <p className="text-body-sm text-on-surface-variant mt-0.5 leading-snug">{notif.message}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
