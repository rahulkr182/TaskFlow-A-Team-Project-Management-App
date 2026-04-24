import Project from '../models/Project.js';

// Check if user has required role in a project
export const requireProjectRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required.' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      const userId = req.user._id.toString();

      // Owner always has access
      if (project.owner.toString() === userId) {
        req.project = project;
        return next();
      }

      // Check member role
      const member = project.members.find(
        (m) => m.user.toString() === userId
      );

      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      if (roles.length > 0 && !roles.includes(member.role)) {
        return res.status(403).json({ message: 'You do not have the required role.' });
      }

      req.project = project;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user is project member (any role)
export const requireProjectMember = requireProjectRole();
