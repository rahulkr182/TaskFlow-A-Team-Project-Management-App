import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4'];

export default function CreateProjectModal({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, description, color });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20" onClick={onClose}>
      <div 
        className="glass-premium rounded-2xl p-6 w-full max-w-md shadow-2xl border border-surface-700 animate-slideDown" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-surface-100 overflow-hidden whitespace-nowrap border-r-2 border-primary-500 pr-2" style={{ width: 'fit-content', animation: 'typing 1s steps(15, end), blink-caret .75s step-end infinite' }}>
            New Project
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
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
            <input id="project-name" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus-ring text-sm transition-all"
              placeholder="My Awesome Project" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus-ring text-sm resize-none transition-all"
              placeholder="What's this project about?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
            {mutation.isPending ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
