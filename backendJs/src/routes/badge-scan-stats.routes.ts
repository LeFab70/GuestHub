import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { badgeScanStatsService } from '../services/badge-scan-stats.service';
import { authenticateToken } from '../middlewares/auth';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Ajouter un enregistrement de scan
router.post('/add', [
  body('qrCode').notEmpty().withMessage('QR Code is required'),
  body('action').isIn(['scan', 'check-out']).withMessage('Action must be scan or check-out'),
  body('visitorName').optional().isString(),
  body('employeeName').optional().isString(),
  body('departmentName').optional().isString(),
  body('visitId').optional().isString(),
  body('badgeId').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        statusCode: 400,
        data: { errors: errors.array() }
      };
      return res.status(400).json(response);
    }

    const scanRecord = await badgeScanStatsService.addScanRecord({
      qrCode: req.body.qrCode,
      action: req.body.action,
      visitorName: req.body.visitorName,
      employeeName: req.body.employeeName,
      departmentName: req.body.departmentName,
      visitId: req.body.visitId,
      badgeId: req.body.badgeId,
      scannedBy: req.user?.id
    });

    const response: ApiResponse = {
      success: true,
      data: scanRecord,
      message: 'Scan record added successfully',
      statusCode: 201
    };

    return res.status(201).json(response);
  } catch (error: any) {
    logger.error('Add scan record failed:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error.message || 'Failed to add scan record',
      statusCode: 500
    };
    return res.status(500).json(response);
  }
});

// Obtenir les statistiques de scan
router.get('/stats', async (req: any, res: any) => {
  try {
    const stats = await badgeScanStatsService.getScanStats();

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Scan statistics retrieved successfully',
      statusCode: 200
    };

    return res.status(200).json(response);
  } catch (error: any) {
    logger.error('Get scan stats failed:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error.message || 'Failed to get scan statistics',
      statusCode: 500
    };
    return res.status(500).json(response);
  }
});

// Obtenir les scans récents
router.get('/recent', async (req: any, res: any) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recentScans = await badgeScanStatsService.getRecentScans(limit);

    const response: ApiResponse = {
      success: true,
      data: recentScans,
      message: 'Recent scans retrieved successfully',
      statusCode: 200
    };

    return res.status(200).json(response);
  } catch (error: any) {
    logger.error('Get recent scans failed:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error.message || 'Failed to get recent scans',
      statusCode: 500
    };
    return res.status(500).json(response);
  }
});

// Nettoyer les anciens enregistrements (admin seulement)
router.delete('/cleanup', async (req: any, res: any) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user?.role !== 'ADMIN') {
      const response: ApiResponse = {
        success: false,
        message: 'Access denied. Admin role required.',
        statusCode: 403
      };
      return res.status(403).json(response);
    }

    const deletedCount = await badgeScanStatsService.cleanupOldRecords();

    const response: ApiResponse = {
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old scan records`,
      statusCode: 200
    };

    return res.status(200).json(response);
  } catch (error: any) {
    logger.error('Cleanup old scan records failed:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error.message || 'Failed to cleanup old scan records',
      statusCode: 500
    };
    return res.status(500).json(response);
  }
});

export default router;
