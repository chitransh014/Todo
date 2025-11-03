import cron from 'node-cron';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';

export const startFailTracker = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running fail tracker job...');

    try {
      const now = new Date();

      // Find overdue tasks
      const overdueTasks = await Task.find({
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: now },
      });

      for (const task of overdueTasks) {
        // Mark as failed
        task.status = 'failed';
        await task.save();

        console.log(`Task "${task.title}" marked as failed (overdue)`);

        // Optionally, notify user or log to a fail log
        // For now, just log
      }

      // Check goals with no progress (all tasks failed or overdue)
      const goals = await Goal.find({ status: 'active' });
      for (const goal of goals) {
        const tasks = await Task.find({ goalId: goal._id });
        const allFailed = tasks.every(task => task.status === 'failed');

        if (allFailed && tasks.length > 0) {
          console.log(`Goal "${goal.title}" has all tasks failed - consider notifying user`);
          // Could send email or notification here
        }
      }

      console.log('Fail tracker job completed');
    } catch (error) {
      console.error('Error in fail tracker job:', error);
    }
  });

  console.log('Fail tracker job scheduled');
};
