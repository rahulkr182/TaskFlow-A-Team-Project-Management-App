import Activity from '../models/Activity.js';

export const getActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ activities });
  } catch (error) { next(error); }
};
