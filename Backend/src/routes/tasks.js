// ✅ routes/tasks.js (FULL FIXED VERSION)
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
    .try(Joi.date(), Joi.string().isoDate(), Joi.allow(null))
    .optional(),
  notificationId: Joi.string().allow(null).optional(),
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
    .try(Joi.date(), Joi.string().isoDate(), Joi.allow(null))
    .optional(),
  status: Joi.string()
    .valid("pending", "in_progress", "completed", "failed")
    .optional(),
  notificationId: Joi.string().allow(null).optional(),
  subtasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        completed: Joi.boolean().optional()
      })
    )
    .optional()
});

/* ------------------------- ADD TASK ------------------------- */

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
      userId: req.user._id,
      subtasks: subtasks || []
    });

    await task.save();

    res.status(201).json({ message: "Task added successfully", task });
  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- GET ALL TASKS ------------------------- */

router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1
    });

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- GET SINGLE TASK ------------------------- */

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- UPDATE TASK ------------------------- */

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updateData = { ...value };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- DELETE TASK ------------------------- */

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- AI BREAKDOWN ------------------------- */

router.post("/ai-breakdown", authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const subtasks = await breakdownTask(title, description);
    res.json({ subtasks });
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    res.status(500).json({ error: "AI Breakdown failed" });
  }
});

/* ------------------------- TODAY'S TASKS ------------------------- */

router.get("/today", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: { $ne: "completed" }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ tasks });
  } catch (error) {
    console.error("Today's tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ============================================================
    🔥 SUBTASK ROUTES (NEW + REQUIRED)
   ============================================================ */

/* ➕ ADD SUBTASK */
router.post("/:id/subtasks", authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Subtask title required" });

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const subtask = { title, completed: false };
    task.subtasks.push(subtask);
    await task.save();

    res.json({ subtask: task.subtasks[task.subtasks.length - 1] });
  } catch (error) {
    console.error("Add subtask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* 🔄 TOGGLE SUBTASK */
router.put("/:taskId/subtasks/:subtaskId/toggle", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user._id
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    const sub = task.subtasks.id(req.params.subtaskId);
    if (!sub) return res.status(404).json({ error: "Subtask not found" });

    sub.completed = !sub.completed;

    await task.save();
    res.json({ message: "Subtask toggled", sub });
  } catch (error) {
    console.error("Toggle subtask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ✏️ EDIT SUBTASK */
router.put("/:taskId/subtasks/:subtaskId", authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user._id
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    const sub = task.subtasks.id(req.params.subtaskId);
    if (!sub) return res.status(404).json({ error: "Subtask not found" });

    sub.title = title;
    await task.save();

    res.json({ message: "Subtask updated", sub });
  } catch (error) {
    console.error("Edit subtask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* 🗑 DELETE SUBTASK */
router.delete("/:taskId/subtasks/:subtaskId", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user._id
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    task.subtasks = task.subtasks.filter(
      (st) => st._id.toString() !== req.params.subtaskId
    );

    await task.save();

    res.json({ message: "Subtask deleted" });
  } catch (error) {
    console.error("Delete subtask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------- LEARNING STATS ------------------------- */

router.get("/learning/stats", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });

    const completed = tasks.filter((t) => t.status === "completed").length;

    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const recentCompleted = tasks
      .filter((t) => t.status === "completed")
      .slice(-5)
      .reverse();

    res.json({
      completedTasks: completed,
      timeSpent: 0,
      progress: { General: percent },
      recentCompleted
    });
  } catch (error) {
    console.error("Learning stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
