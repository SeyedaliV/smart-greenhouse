import express from 'express';
import { getSensors, getSensor } from '../controllers/sensorController.js';

const router = express.Router();

router.get('/', getSensors);
router.get('/:id', getSensor);

export default router;