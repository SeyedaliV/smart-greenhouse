// routes/authRoutes.js
import express from 'express';
import { signup, login, protect } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

export default router;