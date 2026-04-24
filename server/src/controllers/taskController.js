import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// Get tasks for a project
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .sort({ column: 1, order: 1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Create task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, column, priority, dueDate, assignee, labels } = req.body;

    // Get the highest order in this column
    const lastTask = await Task.findOne({
      project: req.params.projectId,
      column: column || 'To Do',
    }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      column: column || 'To Do',
      order,
      priority: priority || 'medium',
      dueDate,
      assignee,
      creator: req.user._id,
      labels: labels || [],
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('creator', 'name email avatar');

    // Log activity
    await Activity.create({
      project: req.params.projectId,
      task: task._id,
      user: req.user._id,
      action: 'created',
      details: `created task "${task.title}"`,
    });

    // Notify assignee
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignee,
        type: 'task_assigned',
        message: `${req.user.name} assigned you to "${task.title}"`,
        relatedProject: req.params.projectId,
        relatedTask: task._id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${assignee}`).emit('notification', {
          type: 'task_assigned',
          message: `${req.user.name} assigned you to "${task.title}"`,
        });
      }
    }

    // Emit socket event for board
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${req.params.projectId}`).emit('task-created', task);
    }

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignee, labels, column } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (labels !== undefined) updates.labels = labels;
    if (column !== undefined) updates.column = column;

    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Handle assignee change
    if (assignee !== undefined) {
      updates.assignee = assignee || null;
      if (assignee && assignee.toString() !== req.user._id.toString() && 
          (!oldTask.assignee || oldTask.assignee.toString() !== assignee.toString())) {
        await Notification.create({
          recipient: assignee,
          type: 'task_assigned',
          message: `${req.user.name} assigned you to "${oldTask.title}"`,
          relatedProject: oldTask.project,
          relatedTask: oldTask._id,
        });

        const io = req.app.get('io');
        if (io) {
          io.to(`user:${assignee}`).emit('notification', {
            type: 'task_assigned',
            message: `${req.user.name} assigned you to "${oldTask.title}"`,
          });
        }
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar');

    // Log activity
    await Activity.create({
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'updated',
      details: `updated task "${task.title}"`,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('task-updated', task);
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Move task (change column/order)
export const moveTask = async (req, res, next) => {
  try {
    const { column, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const oldColumn = task.column;
    task.column = column;
    task.order = order;
    await task.save();

    await task.populate('assignee', 'name email avatar');
    await task.populate('creator', 'name email avatar');

    // Log activity if column changed
    if (oldColumn !== column) {
      await Activity.create({
        project: task.project,
        task: task._id,
        user: req.user._id,
        action: 'moved',
        details: `moved "${task.title}" from "${oldColumn}" to "${column}"`,
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('task-moved', {
        task,
        fromColumn: oldColumn,
        toColumn: column,
      });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Reorder tasks (batch update)
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, column, order }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id },
        update: { column: t.column, order: t.order },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: 'Tasks reordered.' });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Delete attachments from Cloudinary
    for (const att of task.attachments) {
      if (att.publicId) {
        try { await deleteFromCloudinary(att.publicId); } catch (e) { /* ignore */ }
      }
    }

    await Activity.create({
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'deleted',
      details: `deleted task "${task.title}"`,
    });

    const projectId = task.project;
    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task-deleted', req.params.id);
    }

    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

// Upload attachment
export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    let attachment;
    // Try Cloudinary upload, fallback to base64 if not configured
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        public_id: `taskflow/${task._id}/${Date.now()}`,
      });
      attachment = {
        url: result.secure_url,
        publicId: result.public_id,
        name: req.file.originalname,
        uploadedBy: req.user._id,
      };
    } catch (e) {
      // Cloudinary not configured — store as data URL (dev only)
      const base64 = req.file.buffer.toString('base64');
      attachment = {
        url: `data:${req.file.mimetype};base64,${base64}`,
        publicId: '',
        name: req.file.originalname,
        uploadedBy: req.user._id,
      };
    }

    task.attachments.push(attachment);
    await task.save();

    await Activity.create({
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'attached',
      details: `attached "${req.file.originalname}" to "${task.title}"`,
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Remove attachment
export const removeAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found.' });
    }

    if (attachment.publicId) {
      try { await deleteFromCloudinary(attachment.publicId); } catch (e) { /* ignore */ }
    }

    task.attachments.pull(req.params.attachmentId);
    await task.save();

    res.json({ task });
  } catch (error) {
    next(error);
  }
};
