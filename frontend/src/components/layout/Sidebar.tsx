import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/transaksi', icon: 'receipt_long', label: 'Transaksi' },
  { to: '/budget', icon: 'account_balance_wallet', label: 'Budget' },
  { to: '/tagihan', icon: 'calendar_today', label: 'Tagihan' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
    navigate('/login');
  };

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-[260px] bg-surface border-r border-premium-border z-20">
      {/* Brand */}
      <div className="px-xl py-lg flex items-center gap-3">
        <span className="font-headline text-xl font-bold text-on-surface tracking-tight">FiTrack</span>
      </div>

      {/* Menu */}
      <div className="mt-md flex-1 overflow-y-auto">
        <p className="px-xl mb-sm text-label-caps text-on-surface-variant uppercase tracking-wider">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-4 my-1 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-premium-charcoal text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-body font-medium text-body-md">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

      </div>

      {/* User + Logout */}
      <div className="p-lg mx-4 mb-xl bg-surface-container-low rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-premium-charcoal text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user?.nama?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-body font-semibold text-body-sm text-on-surface truncate">{user?.nama}</p>
            <p className="font-body text-body-sm text-on-surface-variant truncate text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-error transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Keluar
        </button>
      </div>
    </nav>
  );
}
