import express from 'express';
import {
  getAllSensors,
  getSensor,
  deleteSensor,
  createSensor,
  updateSensorValue,
  simulateSensorUpdate,
  simulateConnection,
  getSensorMetrics,
  getPlantSensors,
  getZoneSensors,
  startSimulation,
  stopSimulation
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
router.patch('/:id/value', updateSensorValue);      // PATCH /api/sensors/:id/value
router.post('/:id/simulate', simulateSensorUpdate); // POST /api/sensors/:id/simulate
router.post('/:id/connect', simulateConnection);    // POST /api/sensors/:id/connect

router.get('/:id/metrics', getSensorMetrics);       // GET /api/sensors/:id/metrics

router.get('/plant/:plantId', getPlantSensors);     // GET /api/sensors/plant/:plantId
router.get('/zone/:zoneId/public', getZoneSensors); // GET /api/sensors/zone/:zoneId/public

router.post('/simulation/start', startSimulation);  // POST /api/sensors/simulation/start
router.post('/simulation/stop', stopSimulation);    // POST /api/sensors/simulation/stop

export default router;