import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, FolderKanban, ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
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
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
      isActive
        ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-glow'
        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/60'
    }`;

  return (
    <>
      <aside
        className="fixed top-0 left-0 h-screen bg-surface-950/60 backdrop-blur-xl border-r border-surface-700/50 flex flex-col z-30 transition-all duration-300"
        style={{ width: isOpen ? '16rem' : '4.5rem' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-700/50">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/30 group cursor-pointer">
              <Zap className="w-4 h-4 text-white group-hover:animate-swing" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface-950 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
          {isOpen && (
            <span className="text-lg font-bold text-surface-100 tracking-tight animate-fadeIn">TaskFlow</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5 mb-6">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {isOpen && <span className="animate-fadeIn">Dashboard</span>}
              {!isOpen && <div className="absolute left-14 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all px-2 py-1 rounded-md glass-tooltip text-white text-xs whitespace-nowrap pointer-events-none z-50">Dashboard</div>}
            </NavLink>
            <NavLink to="/projects" className={linkClass}>
              <FolderKanban className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {isOpen && <span className="animate-fadeIn">Projects</span>}
              {!isOpen && <div className="absolute left-14 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all px-2 py-1 rounded-md glass-tooltip text-white text-xs whitespace-nowrap pointer-events-none z-50">Projects</div>}
            </NavLink>
          </div>

          {/* Project List */}
          {isOpen && projects.length > 0 && (
            <div className="pt-3 mt-2 border-t border-surface-800/50">
              <div className="flex items-center justify-between px-3 py-2 mb-1">
                <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Your Projects
                </span>
                <button
                  onClick={() => setShowCreate(true)}
                  className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {projects.slice(0, 8).map((project) => (
                  <button
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}/board`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-400 hover:text-surface-100 hover:bg-surface-800/60 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-700/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm group-hover:scale-125 transition-transform relative z-10"
                      style={{ backgroundColor: project.color || '#6366f1', boxShadow: `0 0 8px ${project.color || '#6366f1'}80` }}
                    />
                    <span className="truncate relative z-10 group-hover:text-white transition-colors">{project.name}</span>
                    {!isOpen && <div className="absolute left-14 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all px-2 py-1 rounded-md glass-tooltip text-white text-xs whitespace-nowrap pointer-events-none z-50">{project.name}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Settings & Toggle */}
        <div className="p-3 border-t border-surface-700 space-y-1">
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
