import express from 'express';
import { Seed } from '../controllers/SeedController.js';
import { 
  getZones, 
  createZone, 
  getZonePlants, 
  getZoneById, 
} from '../controllers/zoneController.js';

const router = express.Router();

router.get('/', getZones);
router.post('/', createZone);
router.post('/seed', Seed);
router.get('/:id', getZoneById);
router.get('/:id/plants', getZonePlants);

export default router;