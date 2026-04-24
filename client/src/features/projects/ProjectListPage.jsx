import { useQuery } from '@tanstack/react-query';
import { Plus, FolderOpen, Users, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../api/axios';
import CreateProjectModal from './CreateProjectModal';

export default function ProjectListPage() {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const projects = data?.projects || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Projects</h1>
          <p className="text-surface-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="create-project-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-surface-700" />
          <h3 className="text-xl font-semibold text-surface-300 mb-2">No projects yet</h3>
          <p className="text-surface-500 mb-6">Create your first project to start managing tasks</p>
          <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}/board`)}
              className="glass rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (project.color || '#6366f1') + '20' }}>
                  <FolderOpen className="w-5 h-5" style={{ color: project.color || '#6366f1' }} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-surface-100 group-hover:text-primary-400 transition mb-1">{project.name}</h3>
              <p className="text-sm text-surface-500 line-clamp-2 mb-4">{project.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-xs text-surface-400">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{project.members?.length || 0}</span>
                <span className="flex items-center gap-1.5"><ListTodo className="w-3.5 h-3.5" />{project.taskCount || 0} tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
