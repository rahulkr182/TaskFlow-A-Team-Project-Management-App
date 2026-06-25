import { Bell, Menu, LogOut, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import NotificationDropdown from '../../features/notifications/NotificationDropdown';
import api from '../../api/axios';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const [showUser, setShowUser] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const userRef = useRef(null);
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    staleTime: 30_000,
  });
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-surface-950/60 backdrop-blur-xl border-b border-surface-700/50 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="p-2.5 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors duration-200 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Minimal Search Bar */}
        <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 focus-within:border-primary-500 transition-colors duration-200 w-full max-w-sm">
          <Search className="w-4 h-4 text-surface-500" />
          <input 
            type="text" 
            placeholder="Search tasks, projects..." 
            className="bg-transparent border-none outline-none text-sm text-surface-100 placeholder-surface-500 w-full"
          />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700">⌘</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
            className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-all duration-200 relative group"
          >
            <Bell className="w-5 h-5 group-hover:animate-swing" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary-500 text-[10px] text-white font-semibold leading-4 text-center border border-surface-950 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-surface-800 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-xs font-semibold">
              {initials || 'U'}
            </div>
            <span className="text-sm font-medium text-surface-300 hidden sm:block">{user?.name || 'User'}</span>
          </button>
          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl py-2 animate-fadeIn z-50">
              <div className="px-4 py-3 border-b border-surface-700/50 mb-1">
                <p className="text-sm font-medium text-surface-100">{user?.name || 'User'}</p>
                <p className="text-xs text-surface-400 mt-0.5 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="px-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
