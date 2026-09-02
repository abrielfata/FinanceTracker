import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex bg-[#F7F6F0] min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-[260px] min-h-screen pb-xxl">
        {children}
      </div>
    </div>
  );
}
