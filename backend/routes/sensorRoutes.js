import express from 'express';
import {
  getAllSensors,
  getSensor,
  deleteSensor,
  createSensor
} from '../controllers/sensorController.js';

import { protect } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllSensors)           // GET /api/sensors
  .post(createSensor);          // POST /api/sensors

router.route('/:id')
  .get(getSensor);              // GET /api/sensors/:id

router.delete('/:id', deleteSensor);

export default router;