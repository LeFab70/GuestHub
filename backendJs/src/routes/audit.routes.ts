import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

// Get audit logs with pagination and filtering
router.get('/logs', 
  authenticateToken,
  requireAdmin,
  auditController.getAuditLogs.bind(auditController)
);

// Get audit log by ID
router.get('/logs/:id',
  authenticateToken,
  requireAdmin,
  auditController.getAuditLogById.bind(auditController)
);

// Get audit statistics
router.get('/stats',
  authenticateToken,
  requireAdmin,
  auditController.getAuditStats.bind(auditController)
);

export default router;
