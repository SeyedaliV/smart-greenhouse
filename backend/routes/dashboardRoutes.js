import express from 'express';
import { protect } from '../controllers/authController.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/', getDashboardData);

export default router;