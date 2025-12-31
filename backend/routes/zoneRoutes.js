import express from 'express';
import { protect } from '../controllers/authController.js';
import { Seed } from '../controllers/SeedController.js';
import {
  getZones,
  createZone,
  getZonePlants,
  getZoneById,
  deleteZone,
} from '../controllers/zoneController.js';

const router = express.Router();

router.use(protect);

router.get('/', getZones);
router.post('/', createZone);

router.post('/seed', Seed);

router.post('/complete-seed', Seed);

router.get('/:id', getZoneById);
router.get('/:id/plants', getZonePlants);
router.delete('/:id', deleteZone);

export default router;
