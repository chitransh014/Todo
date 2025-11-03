import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { sendAccountabilityEmail } from '../utils/email.js';

const router = express.Router();

// Validation schemas
const shareSchema = Joi.object({
  email: Joi.string().email().optional(),
});

// Share accountability endpoint
router.post('/share', authenticateToken, async (req, res) => {
  try {
    const { error, value } = shareSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;
    const userId = req.user._id;
    const userName = req.user.name;

    // Generate share token (expires in 7 days)
    const shareToken = jwt.sign(
      { userId, type: 'accountability' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (email) {
      // Send email
      try {
        if (transporter) {
          await sendAccountabilityEmail(email, shareToken, userName);
          return res.json({
            message: 'Accountability share sent via email',
            shareToken, // Also return token for reference
          });
        } else {
          console.log('Email not configured, returning share link instead');
          const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accountability/${shareToken}`;
          return res.json({
            message: 'Email not configured, here is share link instead',
            shareToken,
            shareLink,
          });
        }
      } catch (emailError) {
        console.error('Email send failed:', emailError);
        return res.status(500).json({ error: 'Failed to send email, but token generated' });
      }
    } else {
      // Just return share link/token
      const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accountability/${shareToken}`;
      return res.json({
        message: 'Accountability share link generated',
        shareToken,
        shareLink,
      });
    }
  } catch (error) {
    console.error('Share accountability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View shared accountability (public endpoint, no auth required)
router.get('/view/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'accountability') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // For now, just return user info (in real app, fetch goals/tasks)
    res.json({
      userId: decoded.userId,
      message: 'Accountability view - goals and tasks would be listed here',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Share link expired' });
    }
    res.status(403).json({ error: 'Invalid share link' });
  }
});

export default router;
