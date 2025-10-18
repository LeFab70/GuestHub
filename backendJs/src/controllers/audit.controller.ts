import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export class AuditController {
  // Get audit logs with pagination and filtering
  async getAuditLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      const { action, entityType, userId, startDate, endDate } = req.query;

      // Build filter conditions
      const where: any = {};
      
      if (action) {
        where.action = action;
      }
      
      if (entityType) {
        where.entityType = entityType;
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      if (startDate || endDate) {
        where.dateHeure = {};
        if (startDate) {
          where.dateHeure.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.dateHeure.lte = new Date(endDate as string);
        }
      }

      // Get audit logs with user information
      const [auditLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true,
              role: true
            }
          }
        },
          orderBy: {
            dateHeure: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.auditLog.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info('Audit logs retrieved successfully', {
        count: auditLogs.length,
        total,
        page,
        totalPages
      });

      res.json({
        success: true,
        data: {
          logs: auditLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        message: 'Audit logs retrieved successfully',
        statusCode: 200
      });
    } catch (error) {
      logger.error('Error retrieving audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve audit logs',
        statusCode: 500
      });
    }
  }

  // Get audit log by ID
  async getAuditLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const auditLog = await prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true,
              role: true
            }
          }
        }
      });

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Audit log not found',
          statusCode: 404
        });
      }

      logger.info('Audit log retrieved successfully', { auditLogId: id });

      return res.json({
        success: true,
        data: auditLog,
        message: 'Audit log retrieved successfully',
        statusCode: 200
      });
    } catch (error) {
      logger.error('Error retrieving audit log:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve audit log',
        statusCode: 500
      });
    }
  }

  // Get audit statistics
  async getAuditStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.dateHeure = {};
        if (startDate) {
          where.dateHeure.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.dateHeure.lte = new Date(endDate as string);
        }
      }

      const [
        totalLogs,
        actionStats,
        userStats,
        entityTypeStats
      ] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: {
            action: true
          }
        }),
        prisma.auditLog.groupBy({
          by: ['userId'],
          where,
          _count: {
            userId: true
          },
          orderBy: {
            _count: {
              userId: 'desc'
            }
          },
          take: 10
        }),
        prisma.auditLog.groupBy({
          by: ['entityType'],
          where,
          _count: {
            entityType: true
          }
        })
      ]);

      // Get user details for top users
      const userIds = userStats.map(stat => stat.userId).filter((id): id is string => Boolean(id));
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true
        }
      });

      const userStatsWithDetails = userStats.map(stat => ({
        ...stat,
        user: users.find(user => user.id === stat.userId)
      }));

      logger.info('Audit statistics retrieved successfully', {
        totalLogs,
        actionStatsCount: actionStats.length,
        userStatsCount: userStats.length,
        entityTypeStatsCount: entityTypeStats.length
      });

      res.json({
        success: true,
        data: {
          totalLogs,
          actionStats,
          userStats: userStatsWithDetails,
          entityTypeStats
        },
        message: 'Audit statistics retrieved successfully',
        statusCode: 200
      });
    } catch (error) {
      logger.error('Error retrieving audit statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve audit statistics',
        statusCode: 500
      });
    }
  }
}

export const auditController = new AuditController();
