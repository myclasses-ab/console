import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileNav from './MobileNav';
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <TopHeader />
      <MobileNav />

      <main
        className={cn(
          'pt-16 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-6 px-4 sm:px-6 transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <div className="max-w-7xl mx-auto py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
