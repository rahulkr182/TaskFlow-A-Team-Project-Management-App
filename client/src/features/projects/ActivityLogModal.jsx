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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
      <div className="w-full max-w-sm glass h-full animate-slideInRight flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-surface-800/50 flex items-center justify-between">
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
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-700 to-surface-800 flex items-center justify-center text-xs font-bold text-surface-300 shrink-0">
                    {act.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-300">
                      <span className="font-semibold text-surface-200">{act.user?.name}</span> {act.details}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">{new Date(act.createdAt).toLocaleString()}</p>
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
