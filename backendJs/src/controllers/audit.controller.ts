import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

export class AuditController {
  // Get all audit logs with pagination and filtering
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const {
        page = '1',
        limit = '10',
        action,
        entityType,
        userId,
        startDate,
        endDate
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const filters = {
        action: action as string,
        entityType: entityType as string,
        userId: userId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result = await auditService.getAuditLogs(pageNum, limitNum, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Audit logs retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get audit logs failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve audit logs',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Get audit log by ID
  async getAuditLogById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const auditLog = await auditService.getAuditLogById(id);

      if (!auditLog) {
        const response: ApiResponse = {
          success: false,
          message: 'Audit log not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: auditLog,
        message: 'Audit log retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get audit log by ID failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve audit log',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Get audit statistics
  async getAuditStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const stats = await auditService.getAuditStats(filters);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Audit statistics retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get audit stats failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve audit statistics',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const auditController = new AuditController();
