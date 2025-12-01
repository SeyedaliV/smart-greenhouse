import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAuditLogs } from '../controllers/auditLogController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAuditLogs);

export default router;


