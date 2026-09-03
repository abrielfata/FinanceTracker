import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getGreeting } from '../../utils/helpers';
import NotificationDropdown from './NotificationDropdown';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center w-full px-4 py-4 md:px-xl md:py-lg sticky top-0 bg-[#F7F6F0]/90 backdrop-blur-sm z-30 border-b border-transparent">
      <div>
        {subtitle ? (
          <p className="font-body text-body-sm text-on-surface-variant">{subtitle}</p>
        ) : (
          <p className="font-body text-body-sm text-on-surface-variant">
            {getGreeting()}, {user?.nama?.split(' ')[0] ?? 'Pengguna'}
          </p>
        )}
        <h1 className="font-headline text-2xl md:text-headline-lg text-on-surface truncate">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {children}
        {/* Lonceng Notifikasi Interaktif */}
        <NotificationDropdown />
        
        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-surface-container-low p-1.5 rounded-full transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-premium-charcoal text-white flex items-center justify-center font-bold">
              {user?.nama?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="font-body font-medium text-on-surface text-body-md leading-tight">{user?.nama}</p>
              <p className="font-body text-on-surface-variant text-xs">Pelajar</p>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-premium border border-premium-border overflow-hidden animate-fade-in z-50 py-2">
              <Link
                to="/pengaturan"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors w-full"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">settings</span>
                Pengaturan Akun
              </Link>
              <div className="h-[1px] w-full bg-premium-border my-1"></div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 px-4 py-3 text-body-md font-medium text-error hover:bg-error-container transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar Akun"
        message="Yakin ingin keluar dari akun aplikasi FiTrack?"
        confirmText="Keluar"
      />
    </header>
  );
}
