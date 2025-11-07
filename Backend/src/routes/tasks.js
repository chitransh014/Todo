import express from 'express';
import Joi from 'joi';
import { authenticateToken } from '../middleware/auth.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import { breakDownGoalIntoTasks } from '../utils/openai.js';
import { calculatePriority } from '../utils/priority.js';

const router = express.Router();

// Validation schemas
const createTaskSchema = Joi.object({
  goalTitle: Joi.string().required(),
  goalDescription: Joi.string().optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().optional(),
});

const addTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  subtasks: Joi.array().items(Joi.object({
    title: Joi.string().required(),
  })).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed').optional(),
});

const addSubtaskSchema = Joi.object({
  title: Joi.string().required(),
});

const updateSubtaskSchema = Joi.object({
  completed: Joi.boolean().optional(),
});

// Create task endpoint - integrates AI for breakdown
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { goalTitle, goalDescription, energyLevel, dueDate } = value;
    const userId = req.user._id;

    // For testing without MongoDB, return mock response
    if (!process.env.MONGODB_URI) {
      return res.status(201).json({
        message: 'Task created successfully (mock mode)',
        goal: {
          id: 'mock-goal-id',
          title: goalTitle,
          description: goalDescription,
          status: 'active',
        },
        tasks: [
          {
            id: 'mock-task-id-1',
            title: 'Mock Task 1',
            description: 'Description from AI breakdown',
            priority: calculatePriority(energyLevel),
            energyLevel,
            status: 'pending',
          },
        ],
      });
    }

    // Create goal
    const goal = new Goal({
      title: goalTitle,
      description: goalDescription,
      userId,
    });
    await goal.save();

    // Use AI to break down goal into tasks
    let tasksData = [];
    try {
      if (openai) {
        tasksData = await breakDownGoalIntoTasks(goalTitle, goalDescription);
      } else {
        console.log('OpenAI not configured, creating single task');
        tasksData = [{ title: goalTitle, description: goalDescription }];
      }
    } catch (aiError) {
      console.error('AI breakdown failed, creating single task:', aiError);
      tasksData = [{ title: goalTitle, description: goalDescription }];
    }

    // Create tasks
    const tasks = [];
    for (const taskData of tasksData) {
      const task = new Task({
        title: taskData.title,
        description: taskData.description,
        dueDate,
        priority: calculatePriority(energyLevel),
        energyLevel,
        userId,
        goalId: goal._id,
      });
      await task.save();
      tasks.push(task);
    }

    res.status(201).json({
      message: 'Tasks created successfully',
      goal: {
        id: goal._id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
      },
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
      })),
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tasks for the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        tasks: [
          {
            id: 'mock-task-id-1',
            title: 'Mock Task 1',
            description: 'Mock description',
            priority: 5,
            energyLevel: 'medium',
            status: 'pending',
            dueDate: null,
          },
        ],
      });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        subtasks: task.subtasks.map(subtask => ({
          id: subtask._id,
          title: subtask.title,
          completed: subtask.completed,
        })),
      })),
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a single task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = addTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { title, description, dueDate, energyLevel } = value;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(201).json({
        message: 'Task added successfully (mock mode)',
        task: {
          id: 'mock-task-id-new',
          title,
          description,
          priority: calculatePriority(energyLevel),
          energyLevel,
          status: 'pending',
          dueDate,
        },
      });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority: calculatePriority(energyLevel),
      energyLevel,
      userId,
      subtasks: value.subtasks || [],
    });
    await task.save();

    res.status(201).json({
      message: 'Task added successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const userId = req.user._id;
    const updateData = value;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        message: 'Task updated successfully (mock mode)',
        task: {
          id,
          ...updateData,
        },
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task updated successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        message: 'Task deleted successfully (mock mode)',
      });
    }

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's tasks based on energy level
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const energy = parseInt(req.query.energy) || 5;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        name: 'Mock User',
        tasks: [
          {
            id: 'mock-task-id-1',
            title: 'Mock Task 1',
            description: 'Mock description',
            priority: 5,
            energyLevel: 'medium',
            status: 'pending',
            dueDate: null,
          },
        ],
      });
    }

    // Get user name
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    const name = user ? user.name : 'User';

    // Get tasks sorted by priority, filtered by energy level
    const tasks = await Task.find({
      userId,
      status: { $ne: 'completed' },
    })
      .sort({ priority: -1 })
      .limit(energy); // Limit based on energy level

    res.status(200).json({
      name,
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
      })),
    });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add subtask to a task
router.post('/:taskId/subtasks', authenticateToken, async (req, res) => {
  try {
    const { error, value } = addSubtaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { taskId } = req.params;
    const { title } = value;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(201).json({
        message: 'Subtask added successfully (mock mode)',
        subtask: {
          id: 'mock-subtask-id',
          title,
          status: 'pending',
        },
      });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newSubtask = { title, completed: false };
    task.subtasks.push(newSubtask);
    await task.save();

    const addedSubtask = task.subtasks[task.subtasks.length - 1];

    res.status(201).json({
      message: 'Subtask added successfully',
      subtask: {
        id: addedSubtask._id,
        title: addedSubtask.title,
        completed: addedSubtask.completed,
      },
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subtask status
router.put('/:taskId/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateSubtaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { taskId, subtaskId } = req.params;
    const updateData = value;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        message: 'Subtask updated successfully (mock mode)',
        subtask: {
          id: subtaskId,
          ...updateData,
        },
      });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    Object.assign(subtask, updateData);
    await task.save();

    res.status(200).json({
      message: 'Subtask updated successfully',
      subtask: {
        id: subtask._id,
        title: subtask.title,
        completed: subtask.completed,
      },
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle subtask completion
router.put('/:taskId/subtasks/:subtaskId/toggle', authenticateToken, async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        message: 'Subtask toggled successfully (mock mode)',
        subtask: {
          id: subtaskId,
          completed: true, // Mock toggle
        },
      });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      message: 'Subtask toggled successfully',
      subtask: {
        id: subtask._id,
        title: subtask.title,
        completed: subtask.completed,
      },
    });
  } catch (error) {
    console.error('Toggle subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subtask
router.delete('/:taskId/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        message: 'Subtask deleted successfully (mock mode)',
      });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    task.subtasks.pull(subtaskId);
    await task.save();

    res.status(200).json({
      message: 'Subtask deleted successfully',
    });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subtask by index
router.delete('/:id/subtasks/:subtaskIndex', authenticateToken, async (req, res) => {
  try {
    const { id, subtaskIndex } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!task.subtasks[subtaskIndex])
      return res.status(404).json({ error: 'Subtask not found' });

    // Remove subtask
    task.subtasks.splice(subtaskIndex, 1);
    await task.save();

    res.status(200).json({ message: 'Subtask deleted', subtasks: task.subtasks });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit subtask title
router.put('/:id/subtasks/:subtaskIndex', authenticateToken, async (req, res) => {
  try {
    const { id, subtaskIndex } = req.params;
    const { title } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!task.subtasks[subtaskIndex])
      return res.status(404).json({ error: 'Subtask not found' });

    task.subtasks[subtaskIndex].title = title;
    await task.save();

    res.status(200).json({ message: 'Subtask updated', subtasks: task.subtasks });
  } catch (error) {
    console.error('Edit subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        task: {
          id,
          title: 'Mock Task',
          description: 'Mock description',
          priority: 5,
          energyLevel: 'medium',
          status: 'pending',
          dueDate: null,
          subtasks: [],
        },
      });
    }

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        energyLevel: task.energyLevel,
        status: task.status,
        dueDate: task.dueDate,
        subtasks: task.subtasks.map(subtask => ({
          id: subtask._id,
          title: subtask.title,
          completed: subtask.completed,
        })),
      },
    });
  } catch (error) {
    console.error('Get single task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
