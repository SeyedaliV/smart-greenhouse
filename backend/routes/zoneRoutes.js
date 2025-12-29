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

// seeder اصلی که در بک‌اند استفاده می‌شود
router.post('/seed', Seed);

// برای سازگاری با فرانت‌اند که از مسیر `/zones/complete-seed` استفاده می‌کند
router.post('/complete-seed', Seed);

router.get('/:id', getZoneById);
router.get('/:id/plants', getZonePlants);
router.delete('/:id', deleteZone);

export default router;
