import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, User, Flag, Paperclip, MessageSquare, Trash2, Send, Upload } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TaskDetailModal({ taskId, projectId, members, onClose }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: taskData } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => (await api.get(`/tasks/${taskId}`)).data,
  });
  const { data: commentData } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => (await api.get(`/comments/task/${taskId}`)).data,
  });

  const task = taskData?.task;
  const comments = commentData?.comments || [];

  const updateMutation = useMutation({
    mutationFn: (updates) => api.put(`/tasks/${taskId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task deleted');
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text) => api.post(`/comments/task/${taskId}`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setCommentText('');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('File uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  if (!task) return null;

  const priorityColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', urgent: 'text-red-400' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
      <div className="w-full max-w-xl glass h-full animate-slideInRight overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editing === 'title' ? (
                <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => { updateMutation.mutate({ title: editValue }); }}
                  onKeyDown={(e) => e.key === 'Enter' && updateMutation.mutate({ title: editValue })}
                  className="text-xl font-bold bg-transparent border-b border-primary-500 text-surface-100 focus:outline-none w-full" />
              ) : (
                <h2 className="text-xl font-bold text-surface-100 cursor-pointer hover:text-primary-400 transition"
                  onClick={() => { setEditing('title'); setEditValue(task.title); }}>
                  {task.title}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => deleteMutation.mutate()} className="p-2 rounded-xl hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Flag className={`w-4 h-4 ${priorityColors[task.priority]}`} />
                <select value={task.priority} onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
                  className="bg-transparent text-surface-300 focus:outline-none cursor-pointer text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-surface-500" />
                <input type="date" value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                  onChange={(e) => updateMutation.mutate({ dueDate: e.target.value || null })}
                  className="bg-transparent text-surface-300 focus:outline-none text-sm [color-scheme:dark]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-surface-500" />
                <select value={task.assignee?._id || ''} onChange={(e) => updateMutation.mutate({ assignee: e.target.value || null })}
                  className="bg-transparent text-surface-300 focus:outline-none cursor-pointer text-sm">
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-surface-400 mb-2">Description</h3>
            {editing === 'desc' ? (
              <textarea autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => updateMutation.mutate({ description: editValue })}
                className="w-full px-3 py-2 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" rows={4} />
            ) : (
              <p className="text-sm text-surface-300 cursor-pointer hover:text-surface-200 transition bg-surface-800/30 rounded-xl p-3 min-h-[60px]"
                onClick={() => { setEditing('desc'); setEditValue(task.description || ''); }}>
                {task.description || 'Click to add description...'}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-surface-400 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> Attachments ({task.attachments?.length || 0})
              </h3>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 text-xs font-medium cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" className="hidden" onChange={(e) => e.target.files[0] && uploadMutation.mutate(e.target.files[0])} />
              </label>
            </div>
            {task.attachments?.length > 0 && (
              <div className="space-y-2">
                {task.attachments.map((att) => (
                  <div key={att._id} className="flex items-center gap-3 p-2.5 bg-surface-800/30 rounded-xl">
                    <Paperclip className="w-4 h-4 text-surface-500 shrink-0" />
                    <a href={att.url} target="_blank" rel="noreferrer" className="text-sm text-primary-400 hover:underline truncate flex-1">{att.name}</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-surface-400 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
            </h3>
            <div className="flex gap-2 mb-4">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commentText.trim() && commentMutation.mutate(commentText.trim())}
                className="flex-1 px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                placeholder="Write a comment..." />
              <button onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())} disabled={!commentText.trim()}
                className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-30 transition">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {c.author?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-surface-200">{c.author?.name}</span>
                      <span className="text-xs text-surface-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-surface-400 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
