import prisma from '../../prisma/prismaClient.js';

// CREATE Task
export const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    // Only allow the logged-in user to create a task under their own account
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: req.user.id // comes from JWT
      },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// READ All Tasks (only for logged-in user)
export const getAllTasks = async (req, res, next) => {
  console.log('Authenticated user:', req.user);
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id }, // only this user's tasks
      include: { user: { select: { id: true, email: true } } },
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// READ One Task (only if it belongs to the logged-in user)
export const getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// UPDATE Task (only if it belongs to the logged-in user)
export const updateTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);

    // Ensure the task belongs to the logged-in user
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });
    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { title, description, completed } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, completed },
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// DELETE Task (only if it belongs to the logged-in user)
export const deleteTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const deletedTask = await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

