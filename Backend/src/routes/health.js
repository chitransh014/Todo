import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Todo AI App Backend is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
