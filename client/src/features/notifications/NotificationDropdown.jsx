import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Bell, CheckCheck, UserPlus, MessageSquare, Calendar, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import { getSocket } from '../../socket/socketClient';

const iconMap = {
  task_assigned: ClipboardList,
  deadline_approaching: Calendar,
  comment_added: MessageSquare,
  project_invite: UserPlus,
  task_updated: ClipboardList,
};

export default function NotificationDropdown() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Listen for real-time notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [queryClient]);

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 glass-premium rounded-2xl shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] border border-surface-700 animate-slideDown overflow-hidden z-50 origin-top-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-surface-200">Notifications</h3>
          {unread > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead.mutate()} className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[22rem] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-surface-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-800/50 rounded-full flex items-center justify-center mb-4 shadow-inner relative">
              <Bell className="w-8 h-8 text-surface-600 absolute" />
              <div className="w-8 h-8 rounded-full border-t-2 border-primary-500/30 animate-spin absolute" />
            </div>
            <p className="text-sm font-medium text-surface-300">You're all caught up</p>
            <p className="text-xs text-surface-500 mt-1">No new notifications</p>
          </div>
        ) : (
          notifications.slice(0, 20).map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div
                key={n._id}
                onClick={() => !n.read && markRead.mutate(n._id)}
                className={`flex items-start gap-3 px-4 py-3 border-b border-surface-800/30 cursor-pointer transition hover:bg-surface-800/30 ${
                  !n.read ? 'bg-primary-500/5' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary-500/20 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-surface-800 text-surface-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.read ? 'text-surface-100' : 'text-surface-400'}`}>{n.message}</p>
                  <p className="text-xs text-surface-600 mt-1 font-medium tracking-wide uppercase">{formatTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0 animate-glow shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}
