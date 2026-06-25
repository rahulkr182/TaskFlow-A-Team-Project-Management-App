import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-100 tracking-tight">Projects</h1>
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
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div variants={itemVariants} key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </motion.div>
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
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              variants={itemVariants}
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}/board`)}
              className="glass p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 hover:border-surface-600 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-start justify-between mb-4 relative z-10">
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
        </motion.div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </motion.div>
  );
}
