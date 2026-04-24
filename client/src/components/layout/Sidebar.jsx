import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, FolderKanban, CheckSquare, Calendar, Settings, ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
import api from '../../api/axios';
import { useState } from 'react';
import CreateProjectModal from '../../features/projects/CreateProjectModal';

export default function Sidebar({ isOpen, onToggle }) {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const projects = data?.projects || [];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 group ${
      isActive
        ? 'text-surface-100 bg-surface-800'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
    }`;

  return (
    <>
      <aside
        className="fixed top-0 left-0 h-screen bg-surface-900 border-r border-surface-700 flex flex-col z-30 transition-all duration-300"
        style={{ width: isOpen ? '16rem' : '4.5rem' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <span className="text-lg font-bold text-surface-100 tracking-tight">TaskFlow</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="space-y-0.5 mb-6">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {isOpen && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/projects" className={linkClass}>
              <FolderKanban className="w-4 h-4 shrink-0" />
              {isOpen && <span>Projects</span>}
            </NavLink>
            <NavLink to="/tasks" className={linkClass}>
              <CheckSquare className="w-4 h-4 shrink-0" />
              {isOpen && <span>Tasks</span>}
            </NavLink>
            <NavLink to="/calendar" className={linkClass}>
              <Calendar className="w-4 h-4 shrink-0" />
              {isOpen && <span>Calendar</span>}
            </NavLink>
          </div>

          {/* Project List */}
          {isOpen && projects.length > 0 && (
            <div className="pt-2 border-t border-surface-800">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Your Projects
                </span>
                <button
                  onClick={() => setShowCreate(true)}
                  className="p-1 rounded hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                {projects.slice(0, 8).map((project) => (
                  <button
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}/board`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Settings & Toggle */}
        <div className="p-3 border-t border-surface-700 space-y-1">
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-4 h-4 shrink-0" />
            {isOpen && <span>Settings</span>}
          </NavLink>
          <button
            onClick={onToggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-colors duration-200"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {isOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} />
      )}
    </>
  );
}
