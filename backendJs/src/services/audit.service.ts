import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface AuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  // Enregistrer une action dans les logs d'audit
  async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          details: data.details || null
        }
      });

      logger.info('Audit log created', {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Ne pas faire échouer la requête principale si l'audit échoue
    }
  }

  // Enregistrer une connexion
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'LOGIN',
      entityType: 'AUTH',
      details: 'User logged in successfully',
      ipAddress,
      userAgent
    });
  }

  // Enregistrer une déconnexion
  async logLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'LOGOUT',
      entityType: 'AUTH',
      details: 'User logged out',
      ipAddress,
      userAgent
    });
  }

  // Enregistrer une création
  async logCreate(userId: string, entityType: string, entityId: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      details: details || `${entityType} created successfully`,
      ipAddress,
      userAgent
    });
  }

  // Enregistrer une mise à jour
  async logUpdate(userId: string, entityType: string, entityId: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      details: details || `${entityType} updated successfully`,
      ipAddress,
      userAgent
    });
  }

  // Enregistrer une suppression
  async logDelete(userId: string, entityType: string, entityId: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      details: details || `${entityType} deleted successfully`,
      ipAddress,
      userAgent
    });
  }

  // Enregistrer un accès
  async logAccess(userId: string, entityType: string, method: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'ACCESS',
      entityType,
      details: details || `${method} ${entityType}`,
      ipAddress,
      userAgent
    });
  }

  // Récupérer tous les logs avec pagination et filtres
  async getAuditLogs(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      
      if (filters.action) {
        where.action = filters.action;
      }
      
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      
      if (filters.userId) {
        where.userId = filters.userId;
      }
      
      if (filters.startDate || filters.endDate) {
        where.dateHeure = {};
        if (filters.startDate) {
          where.dateHeure.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dateHeure.lte = filters.endDate;
        }
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { dateHeure: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                login: true,
                email: true,
                nom: true,
                prenom: true
              }
            }
          }
        }),
        prisma.auditLog.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get audit logs failed:', error);
      throw error;
    }
  }

  // Récupérer un log par ID
  async getAuditLogById(id: string) {
    try {
      const log = await prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              login: true,
              email: true,
              nom: true,
              prenom: true
            }
          }
        }
      });

      return log;
    } catch (error) {
      logger.error('Get audit log by ID failed:', error);
      throw error;
    }
  }

  // Récupérer les statistiques d'audit
  async getAuditStats(filters: any = {}) {
    try {
      const where: any = {};
      
      if (filters.startDate || filters.endDate) {
        where.dateHeure = {};
        if (filters.startDate) {
          where.dateHeure.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dateHeure.lte = filters.endDate;
        }
      }

      const [
        totalLogs,
        actionsCount,
        entityTypesCount,
        usersCount,
        dailyActivity
      ] = await Promise.all([
        prisma.auditLog.count({ where }),
        this.getActionsCount(where),
        this.getEntityTypesCount(where),
        this.getUsersCount(where),
        this.getDailyActivity(where)
      ]);

      return {
        totalLogs,
        actionsCount,
        entityTypesCount,
        usersCount,
        dailyActivity
      };
    } catch (error) {
      logger.error('Get audit stats failed:', error);
      throw error;
    }
  }

  // Helper: Compter les actions
  private async getActionsCount(where: any) {
    const result = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true }
    });

    return result.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);
  }

  // Helper: Compter les types d'entités
  private async getEntityTypesCount(where: any) {
    const result = await prisma.auditLog.groupBy({
      by: ['entityType'],
      where,
      _count: { entityType: true }
    });

    return result.reduce((acc, item) => {
      acc[item.entityType] = item._count.entityType;
      return acc;
    }, {} as Record<string, number>);
  }

  // Helper: Compter par utilisateur
  private async getUsersCount(where: any) {
    const result = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        ...where,
        userId: { not: null }
      },
      _count: { userId: true }
    });

    return result.reduce((acc, item) => {
      acc[item.userId!] = item._count.userId;
      return acc;
    }, {} as Record<string, number>);
  }

  // Helper: Activité quotidienne
  private async getDailyActivity(where: any) {
    const result = await prisma.auditLog.findMany({
      where,
      select: {
        dateHeure: true
      },
      orderBy: { dateHeure: 'asc' }
    });

    // Grouper par jour
    const dailyMap = new Map<string, number>();
    
    result.forEach(log => {
      const date = log.dateHeure.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  // Obtenir les logs d'audit d'un utilisateur
  async getUserAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      return await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { dateHeure: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get user audit logs:', error);
      return [];
    }
  }

  // Obtenir tous les logs d'audit (admin seulement)
  async getAllAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      return await prisma.auditLog.findMany({
        orderBy: { dateHeure: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get all audit logs:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();
