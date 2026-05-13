import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Trash2, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProjectSettingsModal({ project, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [inviteEmail, setInviteEmail] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/projects/${project._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${project._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      window.location.href = '/dashboard';
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (email) => api.post(`/projects/${project._id}/members`, { email, role: 'member' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      setInviteEmail('');
      toast.success('Member invited');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to invite user'),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
      <div className="w-full max-w-md glass h-full animate-slideInRight overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-100">Project Settings</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 transition"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">General</h3>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Project Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm resize-none" />
            </div>
            <button onClick={() => updateMutation.mutate({ name, description })} disabled={updateMutation.isPending}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Team Members</h3>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="User's email address"
                className="flex-1 px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
              <button onClick={() => inviteEmail && inviteMutation.mutate(inviteEmail)} disabled={!inviteEmail || inviteMutation.isPending}
                className="px-4 py-2.5 bg-surface-700 hover:bg-surface-600 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Invite
              </button>
            </div>
            <div className="space-y-2">
              {project.members.map((m) => (
                <div key={m.user?._id || m._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                      {m.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{m.user?.name}</p>
                      <p className="text-xs text-surface-500">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-surface-800/50">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Danger Zone</h3>
            <button onClick={() => { if (window.confirm('Are you sure you want to delete this project?')) deleteMutation.mutate(); }}
              className="flex items-center justify-center gap-2 w-full py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-sm transition-all">
              <Trash2 className="w-4 h-4" /> Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
