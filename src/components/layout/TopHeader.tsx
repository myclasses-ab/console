import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInstitute } from '@/context/InstituteContext';
import { useNotifications } from '@/context/NotificationContext';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import {
  Bell,
  LogOut,
  Menu,
  User,
  ChevronDown,
  Circle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Notification } from '@/types';

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getNotificationRoute(notification: Notification): string | null {
  switch (notification.entityType) {
    case 'INQUIRY':
      return '/leads';
    case 'CREDIT_TOP_UP':
      return '/credits';
    default:
      return null;
  }
}

export default function TopHeader() {
  const { user, logout } = useAuth();
  const { institute } = useInstitute();
  const { sidebarCollapsed, setMobileNavOpen } = useUIStore();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.identifier);
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
    setNotificationsDropdownOpen(false);
  };

  const closeAllDropdowns = () => {
    setProfileDropdownOpen(false);
    setNotificationsDropdownOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 transition-all duration-300 left-0',
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-72'
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
            {institute?.name || 'Institute Console'}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {institute?.tagline || 'Manage your institute'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsDropdownOpen((open) => !open);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={closeAllDropdowns}
              />
              <div className="absolute right-0 top-full mt-1 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-2 max-h-[28rem] flex flex-col">
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                </div>

                <div className="overflow-y-auto flex-1">
                  {sortedNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    sortedNotifications.map((notification) => (
                      <button
                        key={notification.identifier}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0',
                          !notification.isRead && 'bg-primary-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <Circle className="w-2 h-2 mt-2 fill-primary-500 text-primary-500 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {notification.body}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen((open) => !open);
              setNotificationsDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.fullName || 'User'}
            </span>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeAllDropdowns} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    navigate('/settings');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
