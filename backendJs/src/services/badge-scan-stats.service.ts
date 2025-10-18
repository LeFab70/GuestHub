import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export interface BadgeScanRecord {
  id: string;
  qrCode: string;
  action: 'scan' | 'check-out';
  visitorName?: string;
  employeeName?: string;
  departmentName?: string;
  visitId?: string;
  badgeId?: string;
  scannedBy?: string;
  createdAt: Date;
}

export interface ScanStats {
  totalToday: number;
  totalRecent: number; // Last 24 hours
  scansByAction: { [key: string]: number };
  lastScanTime?: Date;
}

export class BadgeScanStatsService {
  // Ajouter un enregistrement de scan
  async addScanRecord(record: Omit<BadgeScanRecord, 'id' | 'createdAt'>): Promise<BadgeScanRecord> {
    try {
      const scanRecord = await prisma.badgeScanRecord.create({
        data: {
          qrCode: record.qrCode,
          action: record.action as 'scan' | 'check-out',
          visitorName: record.visitorName,
          employeeName: record.employeeName,
          departmentName: record.departmentName,
          visitId: record.visitId,
          badgeId: record.badgeId,
          scannedBy: record.scannedBy
        }
      });

      logger.info('Badge scan record created:', scanRecord);
      return scanRecord as BadgeScanRecord;
    } catch (error) {
      logger.error('Error creating badge scan record:', error);
      throw new Error('Failed to create badge scan record');
    }
  }

  // Obtenir les statistiques de scan
  async getScanStats(): Promise<ScanStats> {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Compter les QR codes uniques scannés aujourd'hui
      const todayUniqueQRCodes = await prisma.badgeScanRecord.findMany({
        where: {
          createdAt: {
            gte: startOfDay
          }
        },
        select: {
          qrCode: true
        },
        distinct: ['qrCode']
      });

      // Compter les QR codes uniques scannés dans les dernières 24h
      const recentUniqueQRCodes = await prisma.badgeScanRecord.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        select: {
          qrCode: true
        },
        distinct: ['qrCode']
      });

      // Compter par action
      const scansByAction = await prisma.badgeScanRecord.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        _count: {
          action: true
        }
      });

      // Dernier scan
      const lastScan = await prisma.badgeScanRecord.findFirst({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          createdAt: true
        }
      });

      const stats: ScanStats = {
        totalToday: todayUniqueQRCodes.length,
        totalRecent: recentUniqueQRCodes.length,
        scansByAction: scansByAction.reduce((acc, item) => {
          acc[item.action] = item._count.action;
          return acc;
        }, {} as { [key: string]: number }),
        lastScanTime: lastScan?.createdAt
      };

      return stats;
    } catch (error) {
      logger.error('Error getting scan stats:', error);
      throw new Error('Failed to get scan stats');
    }
  }

  // Obtenir les scans récents
  async getRecentScans(limit: number = 10): Promise<BadgeScanRecord[]> {
    try {
      const recentScans = await prisma.badgeScanRecord.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return recentScans as BadgeScanRecord[];
    } catch (error) {
      logger.error('Error getting recent scans:', error);
      throw new Error('Failed to get recent scans');
    }
  }

  // Nettoyer les anciens enregistrements (plus de 30 jours)
  async cleanupOldRecords(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await prisma.badgeScanRecord.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      logger.info(`Cleaned up ${result.count} old scan records`);
      return result.count;
    } catch (error) {
      logger.error('Error cleaning up old scan records:', error);
      throw new Error('Failed to cleanup old scan records');
    }
  }
}

export const badgeScanStatsService = new BadgeScanStatsService();
