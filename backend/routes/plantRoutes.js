import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAllPlants, getPlant, createPlant, updatePlant, deletePlant } from '../controllers/plantController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllPlants);
// router.get('/:type', getPlant);
router.get('/:id', getPlant);
router.post('/', createPlant);
router.patch('/:id', updatePlant);
router.delete('/:id', deletePlant);

export default router;