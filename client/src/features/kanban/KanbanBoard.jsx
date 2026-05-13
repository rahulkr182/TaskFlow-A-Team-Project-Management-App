import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { Plus, Settings, Activity } from 'lucide-react';
import api from '../../api/axios';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import ProjectSettingsModal from '../projects/ProjectSettingsModal';
import ActivityLogModal from '../projects/ActivityLogModal';
import { getSocket } from '../../socket/socketClient';

const defaultColumns = [
  { name: 'To Do', order: 0 },
  { name: 'In Progress', order: 1 },
  { name: 'Done', order: 2 },
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [createColumn, setCreateColumn] = useState('To Do');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data,
  });

  const { data: taskData } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => (await api.get(`/tasks/project/${projectId}`)).data,
  });

  const project = projectData?.project;
  const tasks = useMemo(() => taskData?.tasks || [], [taskData?.tasks]);
  const columns = useMemo(() => project?.columns || defaultColumns, [project?.columns]);

  // Socket.io real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('join-project', projectId);
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    socket.on('task-created', refresh);
    socket.on('task-updated', refresh);
    socket.on('task-moved', refresh);
    socket.on('task-deleted', refresh);
    return () => {
      socket.emit('leave-project', projectId);
      socket.off('task-created', refresh);
      socket.off('task-updated', refresh);
      socket.off('task-moved', refresh);
      socket.off('task-deleted', refresh);
    };
  }, [projectId, queryClient]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped = {};
    columns.forEach((col) => { grouped[col.name] = []; });
    tasks.forEach((task) => {
      if (grouped[task.column]) grouped[task.column].push(task);
      else if (grouped['To Do']) grouped['To Do'].push(task);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [tasks, columns]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const reorderMutation = useMutation({
    mutationFn: (tasksArr) => api.put('/tasks/reorder', { tasks: tasksArr }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  const findColumn = (id) => {
    // Check if id is a column name
    if (tasksByColumn[id]) return id;
    // Find which column the task belongs to
    for (const [colName, colTasks] of Object.entries(tasksByColumn)) {
      if (colTasks.some((t) => t._id === id)) return colName;
    }
    return null;
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumn(active.id);
    const overCol = findColumn(over.id) || over.id;

    if (!activeCol || !overCol || activeCol === overCol) return;

    // Move task between columns optimistically
    queryClient.setQueryData(['tasks', projectId], (old) => {
      if (!old) return old;
      const newTasks = old.tasks.map((t) =>
        t._id === active.id ? { ...t, column: overCol } : t
      );
      return { ...old, tasks: newTasks };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeCol = findColumn(active.id);
    const overCol = findColumn(over.id) || over.id;

    if (!activeCol || !overCol) return;

    const colTasks = tasksByColumn[overCol] || [];
    const overIndex = colTasks.findIndex((t) => t._id === over.id);
    const newOrder = overIndex >= 0 ? overIndex : colTasks.length;

    // Build reorder array for the target column
    const updatedTasks = [...colTasks.filter((t) => t._id !== active.id)];
    const movedTask = tasks.find((t) => t._id === active.id);
    if (movedTask) {
      updatedTasks.splice(newOrder, 0, movedTask);
      const reorderArr = updatedTasks.map((t, i) => ({ id: t._id, column: overCol, order: i }));
      reorderMutation.mutate(reorderArr);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">{project?.name || 'Board'}</h1>
          <p className="text-surface-400 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-2 mr-2">
            {(project?.members || []).slice(0, 5).map((m) => (
              <div key={m.user?._id || m._id} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 border-2 border-surface-950 flex items-center justify-center text-xs font-bold text-white" title={m.user?.name}>
                {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            ))}
          </div>
          <button onClick={() => { setCreateColumn('To Do'); setShowCreate(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4" /><span>Add Task</span>
          </button>
          <div className="flex bg-surface-800/80 rounded-xl p-1 shadow-sm border border-surface-700/50">
            <button onClick={() => setShowActivity(true)} className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-all">
              <Activity className="w-4 h-4" />
            </button>
            <div className="w-px bg-surface-700 my-1 mx-1" />
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {columns.sort((a, b) => a.order - b.order).map((col) => (
            <KanbanColumn
              key={col.name}
              column={col}
              tasks={tasksByColumn[col.name] || []}
              onAddTask={() => { setCreateColumn(col.name); setShowCreate(true); }}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {showCreate && <CreateTaskModal projectId={projectId} column={createColumn} members={project?.members || []} onClose={() => setShowCreate(false)} />}
      {selectedTask && <TaskDetailModal taskId={selectedTask} projectId={projectId} members={project?.members || []} onClose={() => setSelectedTask(null)} />}
      {showSettings && project && <ProjectSettingsModal project={project} onClose={() => setShowSettings(false)} />}
      {showActivity && <ActivityLogModal projectId={projectId} onClose={() => setShowActivity(false)} />}
    </div>
  );
}
