import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAllDevices, controlDevice, createDevice, deleteDevice } from '../controllers/deviceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllDevices);
router.post('/', createDevice);
router.patch('/:deviceId/control', controlDevice);
router.delete('/:deviceId', deleteDevice);

export default router;
