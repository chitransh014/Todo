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

export default router;
