import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateBadgeRequest, UpdateBadgeRequest, SearchQuery, PaginatedResponse } from '../types';
import { Badge, BadgeEtat } from '@prisma/client';
import * as QRCode from 'qrcode';

export class BadgeService {
  // Créer un badge
  async createBadge(badgeData: CreateBadgeRequest): Promise<Badge> {
    try {
      const newBadge = await prisma.badge.create({
        data: {
          visiteId: badgeData.visiteId,
          qrCode: badgeData.qrCode || '',
          etat: badgeData.etat || BadgeEtat.GENERE,
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      logger.info('Badge created:', newBadge);
      return newBadge;
    } catch (error) {
      logger.error('Error creating badge:', error);
      throw new Error('Failed to create badge');
    }
  }

  // Obtenir un badge par ID
  async getBadgeById(id: string): Promise<Badge | null> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      return badge;
    } catch (error) {
      logger.error(`Error fetching badge with ID ${id}:`, error);
      throw new Error('Failed to fetch badge');
    }
  }

  // Obtenir tous les badges avec pagination
  async getAllBadges(query: SearchQuery): Promise<PaginatedResponse<Badge>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { qrCode: { contains: search, mode: 'insensitive' as const } },
          { visite: { visiteur: { nom: { contains: search, mode: 'insensitive' as const } } } },
          { visite: { visiteur: { prenom: { contains: search, mode: 'insensitive' as const } } } },
          { visite: { employe: { nom: { contains: search, mode: 'insensitive' as const } } } },
          { visite: { employe: { prenom: { contains: search, mode: 'insensitive' as const } } } }
        ]
      } : {};

      const [badges, total] = await Promise.all([
        prisma.badge.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            visite: {
              include: {
                visiteur: true,
                employe: true
              }
            }
          }
        }),
        prisma.badge.count({ where })
      ]);

      return {
        data: badges,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching badges:', error);
      throw new Error('Failed to fetch badges');
    }
  }

  // Mettre à jour un badge
  async updateBadge(id: string, updateData: UpdateBadgeRequest): Promise<Badge | null> {
    try {
      const updatedBadge = await prisma.badge.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      logger.info('Badge updated:', updatedBadge);
      return updatedBadge;
    } catch (error) {
      logger.error(`Error updating badge with ID ${id}:`, error);
      throw new Error('Failed to update badge');
    }
  }

  // Supprimer un badge
  async deleteBadge(id: string): Promise<boolean> {
    try {
      await prisma.badge.delete({
        where: { id }
      });
      logger.info(`Badge with ID ${id} deleted`);
      return true;
    } catch (error) {
      logger.error(`Error deleting badge with ID ${id}:`, error);
      throw new Error('Failed to delete badge');
    }
  }

  // Scanner un badge (lecture QR)
  async scanBadge(qrCode: string): Promise<Badge | null> {
    try {
      const badge = await prisma.badge.findFirst({
        where: { 
          qrCode,
          etat: BadgeEtat.VALIDE
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      
      if (badge) {
        logger.info('Badge scanned successfully:', badge);
      }
      
      return badge;
    } catch (error) {
      logger.error(`Error scanning badge with QR code ${qrCode}:`, error);
      throw new Error('Failed to scan badge');
    }
  }

  // Activer un badge
  async activateBadge(id: string): Promise<Badge | null> {
    try {
      const badge = await prisma.badge.update({
        where: { id },
        data: {
          etat: BadgeEtat.VALIDE,
          updatedAt: new Date()
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      logger.info('Badge activated:', badge);
      return badge;
    } catch (error) {
      logger.error(`Error activating badge with ID ${id}:`, error);
      throw new Error('Failed to activate badge');
    }
  }

  // Désactiver un badge
  async deactivateBadge(id: string): Promise<Badge | null> {
    try {
      const badge = await prisma.badge.update({
        where: { id },
        data: {
          etat: BadgeEtat.GENERE,
          updatedAt: new Date()
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });
      logger.info('Badge deactivated:', badge);
      return badge;
    } catch (error) {
      logger.error(`Error deactivating badge with ID ${id}:`, error);
      throw new Error('Failed to deactivate badge');
    }
  }

  // Obtenir les badges actifs
  async getActiveBadges(query: SearchQuery): Promise<PaginatedResponse<Badge>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = {
        etat: BadgeEtat.VALIDE,
        ...(search ? {
          OR: [
            { qrCode: { contains: search, mode: 'insensitive' as const } },
            { visite: { visiteur: { nom: { contains: search, mode: 'insensitive' as const } } } },
            { visite: { visiteur: { prenom: { contains: search, mode: 'insensitive' as const } } } },
            { visite: { employe: { nom: { contains: search, mode: 'insensitive' as const } } } },
            { visite: { employe: { prenom: { contains: search, mode: 'insensitive' as const } } } }
          ]
        } : {})
      };

      const [badges, total] = await Promise.all([
        prisma.badge.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            visite: {
              include: {
                visiteur: true,
                employe: true
              }
            }
          }
        }),
        prisma.badge.count({ where })
      ]);

      return {
        data: badges,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching active badges:', error);
      throw new Error('Failed to fetch active badges');
    }
  }

  // Générer un QR code pour un badge
  async generateQRCode(id: string): Promise<string | null> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: true
            }
          }
        }
      });

      if (!badge) {
        return null;
      }

      // Générer un QR code unique basé sur l'ID du badge
      const qrData = {
        badgeId: badge.id,
        visiteId: badge.visiteId,
        visitorName: `${badge.visite.visiteur.nom} ${badge.visite.visiteur.prenom}`,
        employeeName: `${badge.visite.employe.nom} ${badge.visite.employe.prenom}`,
        createdAt: badge.createdAt
      };

      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      // Mettre à jour le badge avec le QR code généré
      await prisma.badge.update({
        where: { id },
        data: { qrCode }
      });

      logger.info('QR code generated for badge:', id);
      return qrCode;
    } catch (error) {
      logger.error(`Error generating QR code for badge ${id}:`, error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Obtenir les statistiques des badges
  async getBadgeStats(): Promise<any> {
    try {
      const [
        totalBadges,
        generatedBadges,
        printedBadges,
        validBadges,
        scannedBadges
      ] = await Promise.all([
        prisma.badge.count(),
        prisma.badge.count({ where: { etat: BadgeEtat.GENERE } }),
        prisma.badge.count({ where: { etat: BadgeEtat.IMPRIME } }),
        prisma.badge.count({ where: { etat: BadgeEtat.VALIDE } }),
        prisma.badge.count({ where: { etat: BadgeEtat.SCANNE } })
      ]);

      return {
        totalBadges,
        generatedBadges,
        printedBadges,
        validBadges,
        scannedBadges
      };
    } catch (error) {
      logger.error('Error fetching badge statistics:', error);
      throw new Error('Failed to fetch badge statistics');
    }
  }
}

export const badgeService = new BadgeService();