import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ projectId, column, members, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/tasks/project/${projectId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ title, description, priority, column, dueDate: dueDate || undefined, assignee: assignee || undefined });
  };

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-emerald-400' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20" onClick={onClose}>
      <div className="glass-premium rounded-2xl p-6 w-full max-w-lg animate-slideDown shadow-2xl border border-surface-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-surface-100 overflow-hidden whitespace-nowrap border-r-2 border-primary-500 pr-2" style={{ width: 'fit-content', animation: 'typing 1s steps(15, end), blink-caret .75s step-end infinite' }}>
            New Task
          </h2>
          <style>{`
            @keyframes typing { from { width: 0 } to { width: 100% } }
            @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: var(--color-primary-500); } }
          `}</style>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-white transition-colors group">
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
            <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus-ring text-sm transition-all"
              placeholder="What needs to be done?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus-ring text-sm resize-none transition-all"
              placeholder="Add more details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      priority === p.value ? `priority-badge-${p.value} ring-1 ring-current` : 'bg-surface-800/50 text-surface-400 hover:text-surface-300'
                    }`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 focus-ring text-sm [color-scheme:dark] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Assignee</label>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 focus-ring text-sm [color-scheme:dark] transition-all">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
            {mutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
