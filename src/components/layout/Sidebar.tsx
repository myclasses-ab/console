import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  BookOpen,
  Users,
  Trophy,
  MessageSquare,
  Mail,
  Image,
  HelpCircle,
  Shield,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  GraduationCap,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    title: 'Institute',
    items: [
      { label: 'Institute Profile', icon: Building2, path: '/profile' },
      { label: 'Branches', icon: MapPin, path: '/branches' },
      { label: 'Courses', icon: BookOpen, path: '/courses' },
      { label: 'Faculty', icon: Users, path: '/faculty' },
      { label: 'Facilities', icon: Shield, path: '/facilities' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Results & Awards', icon: Trophy, path: '/results' },
      { label: 'Reviews', icon: MessageSquare, path: '/reviews' },
      { label: 'Inquiries', icon: Mail, path: '/inquiries' },
      { label: 'My Leads', icon: UserCheck, path: '/leads' },
      { label: 'Media', icon: Image, path: '/media' },
      { label: 'FAQs', icon: HelpCircle, path: '/faqs' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Subscription', icon: CreditCard, path: '/subscription' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full bg-[#0b1121] border-r border-slate-800/60 transition-all duration-300 ease-in-out hidden lg:flex flex-col',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-slate-800/60 transition-all duration-300',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-bold text-slate-100 truncate tracking-tight">
              MyClasses
            </span>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Toggle button for collapsed state */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[22px] w-6 h-6 rounded-full bg-[#0b1121] border border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-primary-400 hover:border-primary-500/40 transition-all z-50"
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 space-y-6 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed && (
              <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'group relative flex items-center w-full rounded-lg text-sm font-medium transition-all duration-200',
                      sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2',
                      isActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        'flex-shrink-0 flex items-center justify-center transition-colors duration-200',
                        sidebarCollapsed ? 'w-8 h-8 rounded-lg' : 'w-5 h-5',
                        isActive
                          ? 'text-primary-400'
                          : 'text-slate-500 group-hover:text-slate-300',
                        sidebarCollapsed && isActive && 'bg-primary-500/15'
                      )}
                    >
                      <item.icon size={sidebarCollapsed ? 20 : 18} strokeWidth={isActive ? 2.2 : 2} />
                    </span>

                    {/* Label */}
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Branding */}
      {!sidebarCollapsed && (
        <div className="p-3 mx-3 mb-3">
          <div className="rounded-lg bg-slate-800/40 border border-slate-800/60 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-primary-500/15 flex items-center justify-center">
                <GraduationCap size={14} className="text-primary-400" />
              </div>
              <span className="text-xs font-semibold text-slate-300">MyClasses</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Manage your institute efficiently with our powerful console.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
