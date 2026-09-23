import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex bg-[#F7F6F0] min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <Sidebar />
      <main id="main-content" role="main" className="flex-1 min-w-0 md:ml-[260px] min-h-screen pb-28 sm:pb-24 md:pb-xxl">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

