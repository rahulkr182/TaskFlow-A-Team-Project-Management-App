import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, CheckSquare, Calendar, Activity, Zap } from 'lucide-react';
import api from '../../api/axios';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
  });

  if (isLoading) return <DashboardSkeleton />;

  const stats = data || {};
  const statusMap = {};
  (stats.tasksByStatus || []).forEach((s) => { statusMap[s._id] = s.count; });

  const overviewStats = [
    { label: 'Total Tasks', value: stats.totalTasks || 0, icon: CheckSquare, color: 'text-surface-100', bgColor: 'bg-surface-800' },
    { label: 'Due Today', value: stats.dueTodayTasks || 0, icon: Calendar, color: 'text-primary-400', bgColor: 'bg-primary-500/10' },
    { label: 'In Progress', value: statusMap['In Progress'] || 0, icon: Activity, color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Overdue', value: stats.overdueTasks || 0, icon: AlertTriangle, color: 'text-danger', bgColor: 'bg-danger/10' },
  ];

  const columns = ['To Do', 'In Progress', 'Done'];
  const colColors = { 'To Do': '#64748b', 'In Progress': '#f59e0b', 'Done': '#10b981' };
  const total = stats.totalTasks || 1;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-100 tracking-tight">Welcome back</h1>
        <p className="text-surface-400 text-sm mt-1">Here's what's happening in your workspace today.</p>
      </div>

      {/* A. Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <div key={index} className="glass p-5 hover:border-surface-600 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-surface-400 group-hover:text-surface-300 transition-colors">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-surface-100">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B. Action Section (What should you do next?) */}
        <div className="lg:col-span-2 glass p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-surface-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Action Required
            </h3>
            <span className="text-xs font-medium text-surface-500 bg-surface-800 px-2 py-1 rounded-md">High Priority</span>
          </div>
          
          <div className="flex-1">
            {(stats.actionableTasks || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <p className="text-surface-200 font-medium mb-1">You're all caught up!</p>
                <p className="text-sm text-surface-400">No urgent or due-today tasks.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.actionableTasks.map(task => (
                  <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-800/50 border border-transparent hover:border-surface-700 transition-all group cursor-pointer">
                    <button className="w-5 h-5 rounded-md border border-surface-600 flex items-center justify-center shrink-0 hover:bg-success/20 hover:border-success/50 transition-colors group-hover:border-surface-500">
                      <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-surface-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-surface-500">{task.project?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-surface-700" />
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${new Date(task.dueDate) < new Date() ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* C. Task Status Visualization */}
        <div className="glass p-6">
          <h3 className="text-base font-semibold text-surface-100 mb-6">Task Distribution</h3>
          <div className="space-y-6">
            {columns.map((col) => {
              const count = statusMap[col] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={col}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-300">{col}</span>
                    <span className="text-sm font-medium text-surface-400">{count}</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: colColors[col] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* D. Recent Tasks */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-surface-100">Recent Tasks</h3>
          <button className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">View all</button>
        </div>
        
        {(stats.recentTasks || []).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-6 h-6 text-surface-500" />
            </div>
            <p className="text-surface-200 font-medium mb-2">No tasks yet</p>
            <p className="text-sm text-surface-400 mb-6">Start by creating a new task to get things moving.</p>
            <button className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors">
              Create Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-700/50 text-surface-500 text-xs font-medium uppercase tracking-wider">
                  <th className="pb-3 font-medium px-2">Task</th>
                  <th className="pb-3 font-medium px-2">Status</th>
                  <th className="pb-3 font-medium px-2">Due Date</th>
                  <th className="pb-3 font-medium px-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {stats.recentTasks.slice(0, 5).map((task) => (
                  <tr key={task._id} className="hover:bg-surface-800/30 transition-colors group">
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-surface-200">{task.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{task.project?.name}</p>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${task.column === 'Done' ? 'bg-success' : task.column === 'In Progress' ? 'bg-warning' : 'bg-surface-500'}`} />
                        <span className="text-sm text-surface-300">{task.column}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-surface-400">{formatDate(task.dueDate)}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-md uppercase tracking-wider ${task.priority === 'urgent' ? 'bg-danger/10 text-danger' : task.priority === 'high' ? 'bg-warning/10 text-warning' : 'bg-surface-800 text-surface-400'}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div><div className="h-8 w-40 bg-surface-800 rounded-lg animate-pulse" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass p-5 h-24 animate-pulse"><div className="w-10 h-10 bg-surface-800 rounded-xl" /></div>
        ))}
      </div>
    </div>
  );
}
