import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import accountabilityRoutes from './routes/accountability.js';
import { startFailTracker } from './jobs/failTracker.js';

dotenv.config();

// Connect to MongoDB (optional for now - routes will work without it for testing)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.log('No MongoDB URI provided - running without database connection');
}

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/accountability', accountabilityRoutes);

// Start background jobs
startFailTracker();

// Error handling middleware
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


export default app;
