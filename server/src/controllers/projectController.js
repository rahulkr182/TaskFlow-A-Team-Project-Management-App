import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Get all projects for current user
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Add task count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project.toObject(), taskCount };
      })
    );

    res.json({ projects: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    // Log activity
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'created',
      details: `created project "${project.name}"`,
    });

    res.status(201).json({ project: { ...project.toObject(), taskCount: 0 } });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check access
    const userId = req.user._id.toString();
    const isMember =
      project.owner._id.toString() === userId ||
      project.members.some((m) => m.user._id.toString() === userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, color, columns } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color) updates.color = color;
    if (columns) updates.columns = columns;

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated',
      details: `updated project "${project.name}"`,
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete it.' });
    }

    // Delete all related data
    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

// Invite member
export const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email.' });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    project.members.push({ user: user._id, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    // Create notification for invited user
    await Notification.create({
      recipient: user._id,
      type: 'project_invite',
      message: `${req.user.name} invited you to project "${project.name}"`,
      relatedProject: project._id,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${user._id}`).emit('notification', {
        type: 'project_invite',
        message: `${req.user.name} invited you to project "${project.name}"`,
      });
    }

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated',
      details: `invited ${user.name} to the project`,
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// Remove member
export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const memberUserId = req.params.userId;
    if (project.owner.toString() === memberUserId) {
      return res.status(400).json({ message: 'Cannot remove the project owner.' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberUserId
    );
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({ project });
  } catch (error) {
    next(error);
  }
};
