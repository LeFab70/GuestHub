import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateBadgeRequest, UpdateBadgeRequest, SearchQuery, PaginatedResponse } from '../types';
import { Badge, BadgeStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import { badgeScanStatsService } from './badge-scan-stats.service';

export class BadgeService {
  // Créer un badge
  async createBadge(badgeData: CreateBadgeRequest): Promise<Badge> {
    try {
      // Récupérer la visite avec ses relations
      const visite = await prisma.visite.findUnique({
        where: { id: badgeData.visiteId },
        include: {
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          }
        }
      });

      if (!visite) {
        throw new Error('Visite non trouvée');
      }

      if (!visite.visiteur) {
        throw new Error('Aucun visiteur associé à cette visite');
      }

      if (!visite.employe) {
        throw new Error('Aucun employé associé à cette visite');
      }

      // Générer un QR code unique
      const qrCode = badgeData.qrCode || 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      const newBadge = await prisma.badge.create({
        data: {
          visiteId: badgeData.visiteId,
          qrCode: qrCode,
          status: BadgeStatus.GENERATED
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: {
                include: {
                  department: true
                }
              }
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
                employe: {
                  include: {
                    department: true
                  }
                }
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
  async scanBadge(qrCode: string, scannedBy?: string): Promise<Badge | null> {
    try {
      const badge = await prisma.badge.findFirst({
        where: {
          qrCode,
          status: {
            in: [BadgeStatus.PRINTED, BadgeStatus.CLOSED] // Accepter les badges imprimés et fermés
          }
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: {
                include: {
                  department: true
                }
              }
            }
          }
        }
      });
      
      if (badge) {
        logger.info('Badge scanned successfully:', badge);
        
        // Enregistrer le scan côté serveur
        try {
          await badgeScanStatsService.addScanRecord({
            qrCode,
            action: 'scan',
            visitorName: badge.visite?.visiteur ? `${badge.visite.visiteur.prenom} ${badge.visite.visiteur.nom}` : undefined,
            employeeName: badge.visite?.employe ? `${badge.visite.employe.prenom} ${badge.visite.employe.nom}` : undefined,
            departmentName: badge.visite?.employe?.department?.nom,
            visitId: badge.visite?.id,
            badgeId: badge.id,
            scannedBy
          });
        } catch (scanRecordError) {
          logger.error('Failed to record scan in stats:', scanRecordError);
          // Ne pas faire échouer le scan si l'enregistrement des stats échoue
        }
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
          status: BadgeStatus.PRINTED,
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
          status: BadgeStatus.GENERATED,
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
        status: BadgeStatus.PRINTED,
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
                employe: {
                  include: {
                    department: true
                  }
                }
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
        closedBadges
      ] = await Promise.all([
        prisma.badge.count(),
        prisma.badge.count({ where: { status: BadgeStatus.GENERATED } }),
        prisma.badge.count({ where: { status: BadgeStatus.PRINTED } }),
        prisma.badge.count({ where: { status: BadgeStatus.CLOSED } })
      ]);

      return {
        totalBadges,
        generatedBadges,
        printedBadges,
        closedBadges
      };
    } catch (error) {
      logger.error('Error fetching badge statistics:', error);
      throw new Error('Failed to fetch badge statistics');
    }
  }

  /**
   * Imprimer un badge (changer le statut vers IMPRIME)
   */
  async printBadge(badgeId: string, printedByUserId?: string): Promise<Badge> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: {
                include: {
                  department: true
                }
              }
            }
          }
        }
      });

      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      if (badge.status !== BadgeStatus.GENERATED) {
        throw new Error('Ce badge ne peut pas être imprimé dans son état actuel');
      }

      // Mettre à jour le badge ET la visite associée en une seule transaction
      const result = await prisma.$transaction(async (tx) => {
        // Mettre à jour le badge
        const updatedBadge = await tx.badge.update({
          where: { id: badgeId },
          data: {
            status: BadgeStatus.PRINTED,
            dateImpression: new Date(),
            printById: printedByUserId
          }
        });

        // Mettre à jour la visite associée pour qu'elle soit EN_COURS
        if (badge.visite) {
          await tx.visite.update({
            where: { id: badge.visite.id },
            data: {
              statut: 'EN_COURS',
              updatedAt: new Date()
            }
          });
        }

        // Récupérer le badge avec toutes les relations
        return await tx.badge.findUnique({
          where: { id: badgeId },
          include: {
            visite: {
              include: {
                visiteur: true,
                employe: {
                  include: {
                    department: true
                  }
                }
              }
            }
          }
        });
      });

      return result!;
    } catch (error: any) {
      throw new Error(`Erreur lors de l'impression du badge: ${error.message}`);
    }
  }

  /**
   * Marquer un badge comme en utilisation (remis au visiteur)
   */
  async useBadge(badgeId: string): Promise<Badge> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          visite: true
        }
      });

      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      if (badge.status !== BadgeStatus.PRINTED) {
        throw new Error('Ce badge doit être imprimé avant d\'être utilisé');
      }

      // Mettre à jour la visite associée pour qu'elle soit EN_COURS
      if (badge.visite) {
        await prisma.visite.update({
          where: { id: badge.visite.id },
          data: {
            statut: 'EN_COURS',
            updatedAt: new Date()
          }
        });
      }

      const updatedBadge = await prisma.badge.update({
        where: { id: badgeId },
        data: {
          // In the simplified workflow, using the badge keeps status as PRINTED
          status: BadgeStatus.PRINTED
        },
        include: {
          visite: {
            include: {
              visiteur: true,
              employe: {
                include: {
                  department: true
                }
              }
            }
          }
        }
      });

      return updatedBadge;
    } catch (error: any) {
      throw new Error(`Erreur lors de l'utilisation du badge: ${error.message}`);
    }
  }

  /**
   * Marquer un badge comme rendu (visite terminée)
   */
  async returnBadge(badgeId: string, returnedBy?: string): Promise<Badge> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          visite: true
        }
      });

      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      if (badge.status !== BadgeStatus.PRINTED) {
        throw new Error('Ce badge doit être imprimé/en cours avant d\'être rendu');
      }

      // Mettre à jour le badge ET la visite associée en une seule transaction
      const result = await prisma.$transaction(async (tx) => {
        // Mettre à jour le badge
        const updatedBadge = await tx.badge.update({
          where: { id: badgeId },
          data: {
            status: BadgeStatus.CLOSED,
            updatedAt: new Date()
          }
        });

        // Mettre à jour la visite associée pour qu'elle soit TERMINEE
        if (badge.visite) {
          await tx.visite.update({
            where: { id: badge.visite.id },
            data: {
              statut: 'TERMINEE',
              dateFin: new Date(),
              updatedAt: new Date()
            }
          });
        }

        // Récupérer le badge avec toutes les relations
        return await tx.badge.findUnique({
          where: { id: badgeId },
          include: {
            visite: {
              include: {
                visiteur: true,
                employe: {
                  include: {
                    department: true
                  }
                }
              }
            }
          }
        });
      });

      // Enregistrer le check-out côté serveur
      try {
        await badgeScanStatsService.addScanRecord({
          qrCode: result!.qrCode,
          action: 'check-out',
          visitorName: result!.visite?.visiteur ? `${result!.visite.visiteur.prenom} ${result!.visite.visiteur.nom}` : undefined,
          employeeName: result!.visite?.employe ? `${result!.visite.employe.prenom} ${result!.visite.employe.nom}` : undefined,
          departmentName: result!.visite?.employe?.department?.nom,
          visitId: result!.visite?.id,
          badgeId: result!.id,
          scannedBy: returnedBy
        });
      } catch (scanRecordError) {
        logger.error('Failed to record check-out in stats:', scanRecordError);
        // Ne pas faire échouer le retour si l'enregistrement des stats échoue
      }

      return result!;
    } catch (error: any) {
      throw new Error(`Erreur lors du retour du badge: ${error.message}`);
    }
  }
}

export const badgeService = new BadgeService();