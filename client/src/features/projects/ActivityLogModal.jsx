import { useQuery } from '@tanstack/react-query';
import { X, Activity as ActivityIcon } from 'lucide-react';
import api from '../../api/axios';

export default function ActivityLogModal({ projectId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => (await api.get(`/activity/project/${projectId}`)).data,
  });

  const activities = data?.activities || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50" onClick={onClose}>
      <div className="w-full max-w-sm glass-premium h-full animate-slideInRight flex flex-col border-l border-surface-700/50 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-surface-800/50 flex items-center justify-between bg-surface-900/30">
          <h2 className="text-xl font-bold text-surface-100 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary-400" />
            Activity Log
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center text-surface-500 mt-10">No recent activity</div>
          ) : (
            <div className="relative border-l-2 border-surface-700/50 ml-4 space-y-8 pb-4">
              {activities.map((act, i) => (
                <div key={act._id} className="relative pl-6 animate-slideUp" style={{ animationDelay: `${i * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-surface-800 border-4 border-surface-900 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {act.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="bg-surface-800/20 p-4 rounded-xl border border-surface-700/30 hover:border-surface-600/50 transition-colors">
                    <p className="text-sm text-surface-300 leading-relaxed">
                      <span className="font-semibold text-surface-100">{act.user?.name}</span> {act.details}
                    </p>
                    <p className="text-xs text-surface-500 mt-1 font-medium tracking-wide uppercase">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
