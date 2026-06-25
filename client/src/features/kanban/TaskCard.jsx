import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Paperclip } from 'lucide-react';

export default function TaskCard({ task, onClick, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColors = {
    low: 'border-l-emerald-500',
    medium: 'border-l-amber-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.column !== 'Done';

  return (
    <div
      ref={!isOverlay ? setNodeRef : undefined}
      style={!isOverlay ? style : undefined}
      {...(!isOverlay ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={`glass rounded-xl p-4 cursor-pointer border-l-[4px] ${priorityColors[task.priority] || 'border-l-surface-600'} hover:-translate-y-1 hover:shadow-lg hover:border-surface-500 transition-all duration-300 group ${
        isOverlay ? 'shadow-2xl scale-105 rotate-2 z-50 bg-surface-800' : ''
      }`}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {task.labels.slice(0, 3).map((label) => (
            <span key={label} className="text-[10px] px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-300 font-semibold uppercase tracking-wider border border-primary-500/20">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-surface-100 group-hover:text-white transition mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-surface-500'}`}>
              <Calendar className="w-3 h-3" />
              {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <Paperclip className="w-3 h-3" />{task.attachments.length}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-[10px] font-bold text-white" title={task.assignee.name}>
            {task.assignee.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
