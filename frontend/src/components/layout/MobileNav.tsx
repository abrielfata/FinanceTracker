import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Beranda', exact: true },
  { to: '/transaksi', icon: 'receipt_long', label: 'Transaksi' },
  { to: '/budget', icon: 'account_balance_wallet', label: 'Budget' },
  { to: '/tagihan', icon: 'calendar_today', label: 'Tagihan' },
  { to: '/pengaturan', icon: 'settings', label: 'Akun' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-premium-border pb-2 pt-2 px-2 z-50 flex justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-14 h-8 flex items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[#D1F4E0] text-primary' : ''}`}>
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>
                  {item.icon}
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
