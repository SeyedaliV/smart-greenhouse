import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAuditLogs, deleteAllLogs } from '../controllers/auditLogController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAuditLogs);
router.delete('/all', deleteAllLogs);

export default router;
