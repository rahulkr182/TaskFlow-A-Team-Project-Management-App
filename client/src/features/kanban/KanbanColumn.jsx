import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const colStyles = {
  'To Do': { dot: 'bg-surface-400', count: 'text-surface-400' },
  'In Progress': { dot: 'bg-warning', count: 'text-warning' },
  'Done': { dot: 'bg-success', count: 'text-success' },
};

export default function KanbanColumn({ column, tasks, onAddTask, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.name });
  const style = colStyles[column.name] || colStyles['To Do'];

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 flex flex-col rounded-2xl glass transition-all duration-300 ${
        isOver ? 'bg-primary-500/10 ring-2 ring-primary-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-surface-700/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mb-2 border-b border-surface-700/50 bg-surface-900/30 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <h3 className="text-sm font-semibold text-surface-200">{column.name}</h3>
          <span className={`text-xs font-medium ${style.count} bg-surface-800/60 px-2 py-0.5 rounded-full`}>
            {tasks.length}
          </span>
        </div>
        <button onClick={onAddTask} className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 px-3 pb-3 pt-1 min-h-[150px]">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task._id)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
