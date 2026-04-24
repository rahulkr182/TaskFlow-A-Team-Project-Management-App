import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    });
    const projectIds = projects.map((p) => p._id);

    // Get today's boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [totalTasks, tasksByStatus, overdueTasks, myTasks, recentTasks, dueTodayTasks, actionableTasks] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$column', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: startOfToday },
        column: { $ne: 'Done' },
      }),
      Task.countDocuments({ assignee: userId, column: { $ne: 'Done' } }),
      Task.find({ project: { $in: projectIds } })
        .populate('assignee', 'name avatar')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $gte: startOfToday, $lte: endOfToday },
        column: { $ne: 'Done' },
      }),
      Task.find({
        project: { $in: projectIds },
        column: { $ne: 'Done' },
        $or: [
          { dueDate: { $lte: endOfToday } },
          { priority: { $in: ['high', 'urgent'] } }
        ]
      })
        .populate('project', 'name')
        .sort({ dueDate: 1, priority: -1 })
        .limit(6),
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      totalProjects: projects.length,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      myTasks,
      recentTasks,
      dueTodayTasks,
      actionableTasks,
    });
  } catch (error) { next(error); }
};
