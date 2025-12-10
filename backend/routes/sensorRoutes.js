import express from 'express';
import { getAllSensors, getSensor } from '../controllers/sensorController.js';

const router = express.Router();

router.get('/', getAllSensors);
router.get('/:id', getSensor);

export default router;