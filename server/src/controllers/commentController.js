import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

// Get comments for a task
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

// Add comment
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const comment = await Comment.create({
      text,
      task: req.params.taskId,
      author: req.user._id,
    });

    await comment.populate('author', 'name email avatar');

    // Log activity
    await Activity.create({
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'commented',
      details: `commented on "${task.title}"`,
    });

    // Notify task assignee (if different from commenter)
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.assignee,
        type: 'comment_added',
        message: `${req.user.name} commented on "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${task.assignee}`).emit('notification', {
          type: 'comment_added',
          message: `${req.user.name} commented on "${task.title}"`,
        });
      }
    }

    // Emit to project room
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project}`).emit('comment-added', {
        taskId: task._id,
        comment,
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};
