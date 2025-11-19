import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAllDevices, controlDevice, createDevice } from '../controllers/deviceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllDevices);
router.post('/', createDevice);
router.patch('/:deviceId/control', controlDevice);

export default router;