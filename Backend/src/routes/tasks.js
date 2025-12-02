// ✅ routes/tasks.js
import express from 'express';
import Joi from 'joi';
import { authenticateToken } from '../middleware/auth.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import { breakdownTask } from "../utils/ai.js";

import { calculatePriority } from '../utils/priority.js';

const router = express.Router();

/* ------------------------- Validation Schemas ------------------------- */

const createTaskSchema = Joi.object({
  goalTitle: Joi.string().required(),
  goalDescription: Joi.string().optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate(), Joi.allow(null)).optional(),
});

const addTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  dueDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate(), Joi.allow(null)).optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  subtasks: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      completed: Joi.boolean().optional(),
    })
  ).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  dueDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate(), Joi.allow(null)).optional(),
  energyLevel: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed').optional(),
  subtasks: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      completed: Joi.boolean().optional(),
    })
  ).optional(),
});

/* ------------------------- Add a New Task ------------------------- */

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = addTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description, dueDate, energyLevel, subtasks } = value;
    const userId = req.user._id;

    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: calculatePriority(energyLevel),
      energyLevel,
      userId,
      subtasks: subtasks || [],
    });

    await task.save();

    res.status(201).json({
      message: 'Task added successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        energyLevel: task.energyLevel,
        status: task.status,
        subtasks: task.subtasks,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------- Get All Tasks ------------------------- */

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        energyLevel: task.energyLevel,
        status: task.status,
        subtasks: task.subtasks,
        createdAt: task.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------- Update a Task ------------------------- */

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const userId = req.user._id;
    const updateData = { ...value };

    // ✅ Convert dueDate from string → Date
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
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
        dueDate: task.dueDate,
        energyLevel: task.energyLevel,
        status: task.status,
        subtasks: task.subtasks,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------- Delete a Task ------------------------- */

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
/* ------------------------- AI Breakdown of Task ------------------------- */
router.post("/ai-breakdown", authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const subtasks = await breakdownTask(title, description);
    return res.json({ subtasks });
  } catch (error) {
    console.error("AI Breakdown Route Error:", error);
    return res.status(500).json({ error: "AI Breakdown failed" });
  }
});

/* ------------------------- Today's Tasks ------------------------- */

router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({
      userId,
      status: { $ne: 'completed' },
    })
      .sort({ priority: -1 })
      .limit(10);

    res.status(200).json({
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        energyLevel: task.energyLevel,
        status: task.status,
        subtasks: task.subtasks,
        createdAt: task.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  
});
/* ------------------------- Learning Stats ------------------------- */

router.get('/learning/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({ userId });

    // Completed tasks count
    const completedTasks = tasks.filter(
  t => t.status === "completed" || t.completed === true
).length;


    // Total time spent (if you want, you can store duration field later)
    const totalTimeSpent = tasks
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + (t.duration || 0), 0);

    // Category progress
    const progress = {};
    tasks.forEach(task => {
      const cat = task.energyLevel || "General"; // grouping by energyLevel for now
      if (!progress[cat]) progress[cat] = { done: 0, total: 0 };
      progress[cat].total += 1;
      if (task.status === "completed" || task.completed === true) {
  progress[cat].done += 1;
}

    });

    // Convert to %
    const progressPercent = {};
    for (const cat in progress) {
      progressPercent[cat] =
        progress[cat].total === 0
          ? 0
          : Math.round((progress[cat].done / progress[cat].total) * 100);
    }

    // Recent completed tasks
 const recentCompleted = tasks
  .filter(t => t.status === "completed" || t.completed === true)
  .slice(-5)
  .reverse();


    res.json({
      completedTasks,
      timeSpent: Math.round(totalTimeSpent / 60), // optional conversion
      progress: progressPercent,
      recentCompleted,
    });

  } catch (error) {
    console.error("Learning stats error:", error);
    res.status(500).json({ error: "Failed to fetch learning stats" });
  }
});


export default router;
