// ✅ routes/tasks.js
import express from "express";
import Joi from "joi";
import { authenticateToken } from "../middleware/auth.js";
import Task from "../models/Task.js";
import { breakdownTask } from "../utils/ai.js";

const router = express.Router();

/* ------------------------- Validation Schemas ------------------------- */

const addTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  dueDate: Joi.alternatives()
    .try(Joi.date(), Joi.string(), Joi.allow(null))
    .optional(),
  notificationId: Joi.string().allow(null).optional(),

  // ⭐ allow this in validation
  aiGeneratedOnce: Joi.boolean().optional(),

  subtasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        completed: Joi.boolean().optional()
      })
    )
    .optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
  dueDate: Joi.alternatives()
    .try(Joi.date(), Joi.string(), Joi.allow(null))
    .optional(),

  status: Joi.string()
    .valid("pending", "in_progress", "completed", "failed")
    .optional(),

  notificationId: Joi.string().allow(null).optional(),

  // ⭐ allow updating this too
  aiGeneratedOnce: Joi.boolean().optional(),

  subtasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        completed: Joi.boolean().optional()
      })
    )
    .optional()
});

/* ------------------------- Add New Task ------------------------- */

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { error, value } = addTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, description, dueDate, subtasks, notificationId } = value;

    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
      notificationId: notificationId || null,
      subtasks: subtasks || [],

      // ⭐ Save the AI flag
      aiGeneratedOnce: value.aiGeneratedOnce || false,

      userId: req.user._id,
    });

    await task.save();

    return res.status(201).json({
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    console.error("Add task error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- Get All Tasks ------------------------- */

router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- Get Single Task ------------------------- */

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- Update Task ------------------------- */

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updateData = { ...value };

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // ⭐ Mark completion time
    if (updateData.status === "completed") {
      updateData.completedAt = new Date();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- Delete Task ------------------------- */

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- AI Breakdown ------------------------- */

router.post("/ai-breakdown", authenticateToken, async (req, res) => {
  try {
    const { taskId, title, description } = req.body;

    if (!title)
      return res.status(400).json({ error: "Title is required" });

    const subtasks = await breakdownTask(title, description);

    // ⭐ When AI is used, mark the task as AI-used
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, { aiGeneratedOnce: true });
    }

    return res.json({ subtasks });
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    return res.status(500).json({ error: "AI Breakdown failed" });
  }
});

/* ------------------------- Today's Tasks ------------------------- */

router.get("/today", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: { $ne: "completed" },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ tasks });
  } catch (error) {
    console.error("Today's tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- Learning Stats ------------------------- */

router.get("/learning/stats", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      completedAt: -1,
    });

    const completedTasks = tasks.filter((t) => t.status === "completed");

    const recentCompleted = completedTasks.slice(0, 5).map((t) => ({
      _id: t._id,
      title: t.title,
      completedAt: t.completedAt || t.updatedAt || t.createdAt,
    }));

    /* ---------- Streak ---------- */
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 50; i++) {
      const check = new Date(today);
      check.setDate(today.getDate() - i);
      check.setHours(0, 0, 0, 0);

      const done = completedTasks.some((t) => {
        const d = new Date(t.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === check.getTime();
      });

      if (done) streak++;
      else break;
    }

    /* ---------- Weekly Graph ---------- */

    const weekly = Array(7).fill(0);

    completedTasks.forEach((t) => {
      const d = new Date(t.completedAt);
      d.setHours(0, 0, 0, 0);

      const todayFixed = new Date();
      todayFixed.setHours(0, 0, 0, 0);

      const diff =
        (todayFixed.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

      const dayDiff = Math.floor(diff);

      if (dayDiff >= 0 && dayDiff < 7) {
        weekly[6 - dayDiff] += 1;
      }
    });

    return res.json({
      completedTasks: completedTasks.length,
      timeSpent: 0,
      streak,
      weekly,
      recentCompleted,
    });
  } catch (error) {
    console.error("Learning stats error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
