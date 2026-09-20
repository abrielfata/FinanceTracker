import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Beranda', exact: true },
  { to: '/transaksi', icon: 'receipt_long', label: 'Transaksi' },
  { to: '/budget', icon: 'account_balance_wallet', label: 'Budget' },
  { to: '/tagihan', icon: 'calendar_today', label: 'Tagihan' },
];


export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-1 w-full max-w-[420px] bg-premium-charcoal/95 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-300 group flex-1 ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 bg-primary rounded-full shadow-[0_2px_12px_rgba(0,53,39,0.5)] animate-fade-in -z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${
                      isActive ? 'filled scale-110 text-white' : 'group-hover:scale-105'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-tight transition-all duration-300 ${
                      isActive ? 'font-bold text-white scale-105' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

