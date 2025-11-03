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

// ✅ Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.log('⚠️ No MongoDB URI provided - running without database connection');
}

const app = express();

// ✅ Fix CORS for Expo + Render
app.use(cors({
  origin: [
    'http://localhost:8081',                 // for Expo local dev
    'http://localhost:3000',                 // for web dev (if any)
    'https://todo-backend-83q7.onrender.com', // backend itself
    'exp://localhost:8081',                  // Expo Go local
    'https://expo.dev',                      // Expo production
    '*',                                     // fallback (allow all)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/accountability', accountabilityRoutes);

// ✅ Background jobs
startFailTracker();

// ✅ Health check for Render
app.get('/', (req, res) => {
  res.send('🚀 Todo AI Backend running successfully!');
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
