import express from 'express';
import { protect } from '../controllers/authController.js';
import { runAutomationTick } from '../controllers/automationController.js';

const router = express.Router();

router.use(protect);

router.post('/tick', runAutomationTick);

export default router;


