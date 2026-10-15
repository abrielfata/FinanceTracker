import { useState, useEffect, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import WhatsNewModal, { LAST_SEEN_STORAGE_KEY } from '../ui/WhatsNewModal';
import { CURRENT_APP_VERSION } from '../../config/changelog';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem(LAST_SEEN_STORAGE_KEY);
      if (lastSeen !== CURRENT_APP_VERSION) {
        setShowWhatsNew(true);
      }
    } catch {
      // LocalStorage might be disabled or restricted
    }
  }, []);

  return (
    <div className="flex bg-[#F7F6F0] min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <Sidebar />
      <main id="main-content" role="main" className="flex-1 min-w-0 md:ml-[260px] min-h-screen pb-28 sm:pb-24 md:pb-xxl">
        {children}
      </main>
      <MobileNav />
      <WhatsNewModal 
        isOpen={showWhatsNew} 
        onClose={() => setShowWhatsNew(false)} 
      />
    </div>
  );
}


