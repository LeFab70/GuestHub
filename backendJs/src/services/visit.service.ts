import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateVisiteRequest, UpdateVisiteRequest, SearchQuery, PaginatedResponse } from '../types';
import { Visite, VisitStatus, BadgeStatus } from '@prisma/client';

export class VisitService {
  // Confirmer une visite par le visiteur
  async confirmVisitByVisitor(visitId: string, visitorName: string): Promise<{ success: boolean; message: string; data?: any; statusCode?: number }> {
    try {
      // Vérifier que la visite existe et est en statut PLANIFIEE
      const visit = await prisma.visite.findUnique({
        where: { id: visitId },
        include: {
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          },
          badge: true
        }
      });

      if (!visit) {
        return {
          success: false,
          message: 'Visite non trouvée',
          statusCode: 404
        };
      }

      if (visit.statut !== 'PLANIFIEE') {
        return {
          success: false,
          message: 'Cette visite ne peut pas être confirmée',
          statusCode: 400
        };
      }

      // Mettre à jour la visite avec la confirmation
      const updatedVisit = await prisma.visite.update({
        where: { id: visitId },
        data: {
          confirmByVisitor: visitorName,
          confirmedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          },
          badge: true
        }
      });

      logger.info('Visit confirmed by visitor', {
        visitId,
        visitorName,
        visitorId: visit.visiteurId,
        employeeName: `${visit.employe.prenom} ${visit.employe.nom}`,
        departmentName: visit.employe.department?.nom || 'Unknown',
        service: 'guesthub-backend'
      });

      return {
        success: true,
        message: 'Visite confirmée avec succès',
        data: updatedVisit,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error confirming visit by visitor', {
        error: error instanceof Error ? error.message : 'Unknown error',
        visitId,
        visitorName,
        service: 'guesthub-backend'
      });
      return {
        success: false,
        message: 'Erreur lors de la confirmation de la visite',
        statusCode: 500
      };
    }
  }

  async getScheduledVisitsByVisitor(visiteurId: string): Promise<{ success: boolean; message: string; data?: any; statusCode?: number }> {
    try {
      const visits = await prisma.visite.findMany({
        where: {
          visiteurId: visiteurId,
          statut: 'PLANIFIEE'
        },
        include: {
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          },
          badge: true
        },
        orderBy: {
          dateDebut: 'asc'
        }
      });

      logger.info('Scheduled visits retrieved for visitor', {
        visiteurId,
        count: visits.length,
        service: 'guesthub-backend'
      });

      return {
        success: true,
        message: 'Visites planifiées récupérées avec succès',
        data: visits,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error retrieving scheduled visits for visitor', {
        error: error instanceof Error ? error.message : 'Unknown error',
        visiteurId,
        service: 'guesthub-backend'
      });
      return {
        success: false,
        message: 'Erreur lors de la récupération des visites planifiées',
        statusCode: 500
      };
    }
  }

  // Créer une visite
  async createVisit(visitData: CreateVisiteRequest): Promise<Visite> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const newVisit = await tx.visite.create({
          data: {
            visiteurId: visitData.visiteurId,
            employeId: visitData.employeId,
            dateDebut: visitData.dateDebut,
            dateFin: visitData.dateFin,
            motif: visitData.motif,
            statut: VisitStatus.PLANIFIEE,
            // Si c'est une visite créée par le visiteur lui-même, la marquer comme confirmée
            confirmByVisitor: visitData.confirmByVisitor || null,
            confirmedAt: visitData.confirmByVisitor ? new Date() : null
          }
        });

        await tx.badge.create({
          data: {
            visiteId: newVisit.id,
            qrCode: 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            status: BadgeStatus.GENERATED
          }
        });

        const visitWithBadge = await tx.visite.findUnique({
          where: { id: newVisit.id },
          include: {
            visiteur: true,
            employe: {
              include: {
                department: true
              }
            },
            badge: true
          }
        });

        return visitWithBadge!;
      });

      logger.info('Visit created with badge:', result);
      return result;
    } catch (error) {
      logger.error('Error creating visit:', error);
      throw new Error('Failed to create visit');
    }
  }

  // Obtenir une visite par ID
  async getVisitById(id: string): Promise<Visite | null> {
    try {
      const visit = await prisma.visite.findUnique({
        where: { id },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });
      return visit;
    } catch (error) {
      logger.error(`Error fetching visit with ID ${id}:`, error);
      throw new Error('Failed to fetch visit');
    }
  }

  // Obtenir toutes les visites avec pagination
  async getAllVisits(query: SearchQuery): Promise<PaginatedResponse<Visite>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', visiteurId, statut } = query;
      const skip = (page - 1) * limit;

      // Construire la clause where avec tous les filtres
      const whereConditions: any = {};

      // Filtre par recherche textuelle
      if (search) {
        whereConditions.OR = [
          { motif: { contains: search, mode: 'insensitive' as const } },
          { visiteur: { nom: { contains: search, mode: 'insensitive' as const } } },
          { visiteur: { prenom: { contains: search, mode: 'insensitive' as const } } },
          { employe: { nom: { contains: search, mode: 'insensitive' as const } } },
          { employe: { prenom: { contains: search, mode: 'insensitive' as const } } }
        ];
      }

      // Filtre par visiteur
      if (visiteurId) {
        whereConditions.visiteurId = visiteurId;
      }

      // Filtre par statut
      if (statut) {
        whereConditions.statut = statut;
      }

      const where = Object.keys(whereConditions).length > 0 ? whereConditions : {};

      const [visits, total] = await Promise.all([
        prisma.visite.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            visiteur: true,
            employe: {
              include: {
                department: true
              }
            },
            badge: true
          }
        }),
        prisma.visite.count({ where })
      ]);

      return {
        data: visits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching visits:', error);
      throw new Error('Failed to fetch visits');
    }
  }

  // Mettre à jour une visite
  async updateVisit(id: string, updateData: UpdateVisiteRequest): Promise<Visite | null> {
    try {
      // Récupérer la visite actuelle pour vérifier le statut
      const currentVisit = await prisma.visite.findUnique({
        where: { id },
        include: { badge: true }
      });

      if (!currentVisit) {
        throw new Error('Visite non trouvée');
      }

      // Enforcer les règles pour PLANIFIEE: visiteur/employé requis
      if (updateData.statut === 'PLANIFIEE') {
        const visiteurId = updateData.visiteurId || currentVisit.visiteurId;
        const employeId = updateData.employeId || currentVisit.employeId;
        if (!visiteurId || !employeId) {
          throw new Error('Une visite planifiée doit avoir un visiteur et un employé associés');
        }
      }

      const updatedVisit = await prisma.visite.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });

      // Synchroniser/créer le badge
      if (updateData.statut) {
        // Créer le badge si absent
        let badge = await prisma.badge.findUnique({ where: { visiteId: updatedVisit.id } }).catch(() => null);
        if (!badge) {
          badge = await prisma.badge.create({
            data: {
              visiteId: updatedVisit.id,
              qrCode: 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              status: 'GENERATED'
            }
          });
        }

        // Déterminer le statut attendu du badge
        let nextBadgeStatus = badge.status;
        if (updateData.statut === 'EN_COURS') nextBadgeStatus = 'PRINTED';
        else if (updateData.statut === 'TERMINEE' || updateData.statut === 'EXPIREE') nextBadgeStatus = 'CLOSED';
        else if (updateData.statut === 'PLANIFIEE') nextBadgeStatus = 'GENERATED';

        if (nextBadgeStatus !== badge.status) {
          await prisma.badge.update({
            where: { id: badge.id },
            data: { status: nextBadgeStatus, updatedAt: new Date() }
          });
        }
      }

      // Récupérer la visite mise à jour avec le badge synchronisé
      const finalVisit = await prisma.visite.findUnique({
        where: { id },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });

      logger.info('Visit updated:', finalVisit);
      return finalVisit;
    } catch (error) {
      logger.error(`Error updating visit with ID ${id}:`, error);
      throw new Error('Failed to update visit');
    }
  }

  // Supprimer une visite
  async deleteVisit(id: string): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // D'abord, supprimer le badge associé
        await tx.badge.deleteMany({
          where: { visiteId: id }
        });
        
        // Ensuite, supprimer la visite
        await tx.visite.delete({
          where: { id }
        });
      });
      
      logger.info(`Visit with ID ${id} and associated badge deleted`);
      return true;
    } catch (error) {
      logger.error(`Error deleting visit with ID ${id}:`, error);
      throw new Error('Failed to delete visit');
    }
  }

  // Rechercher des visites
  async searchVisits(query: SearchQuery): Promise<PaginatedResponse<Visite>> {
    return this.getAllVisits(query);
  }

  // Check-in d'une visite
  async checkIn(id: string): Promise<Visite | null> {
    try {
      const visit = await prisma.visite.update({
        where: { id },
        data: {
          statut: VisitStatus.EN_COURS,
          updatedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });
      logger.info('Visit checked in:', visit);
      return visit;
    } catch (error) {
      logger.error(`Error checking in visit with ID ${id}:`, error);
      throw new Error('Failed to check in visit');
    }
  }

  // Check-out d'une visite
  async checkOut(id: string): Promise<Visite | null> {
    try {
      // Récupérer la visite avec ses badges
      const visit = await prisma.visite.findUnique({
        where: { id },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      // Mettre à jour la visite
      const updatedVisit = await prisma.visite.update({
        where: { id },
        data: {
          statut: VisitStatus.TERMINEE,
          dateFin: new Date(),
          updatedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: true,
          badge: true
        }
      });

      // Mettre à jour le badge associé à cette visite (one-to-one)
      await prisma.badge.update({
        where: { visiteId: id },
        data: {
          status: BadgeStatus.CLOSED,
          updatedAt: new Date()
        }
      });

      logger.info('Visit checked out:', updatedVisit);
      return updatedVisit;
    } catch (error) {
      logger.error(`Error checking out visit with ID ${id}:`, error);
      throw new Error('Failed to check out visit');
    }
  }

  // Obtenir les visites en cours
  async getActiveVisits(query: SearchQuery): Promise<PaginatedResponse<Visite>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = {
        statut: VisitStatus.EN_COURS,
        ...(search ? {
          OR: [
            { motif: { contains: search, mode: 'insensitive' as const } },
            { visiteur: { nom: { contains: search, mode: 'insensitive' as const } } },
            { visiteur: { prenom: { contains: search, mode: 'insensitive' as const } } },
            { employe: { nom: { contains: search, mode: 'insensitive' as const } } },
            { employe: { prenom: { contains: search, mode: 'insensitive' as const } } }
          ]
        } : {})
      };

      const [visits, total] = await Promise.all([
        prisma.visite.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            visiteur: true,
            employe: {
              include: {
                department: true
              }
            },
            badge: true
          }
        }),
        prisma.visite.count({ where })
      ]);

      return {
        data: visits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching active visits:', error);
      throw new Error('Failed to fetch active visits');
    }
  }

  // Obtenir les statistiques des visites
  async getVisitStats(startDate?: string, endDate?: string): Promise<any> {
    try {
      const dateFilter = {
        ...(startDate && endDate ? {
          dateDebut: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      };

      const [
        totalVisits,
        plannedVisits,
        activeVisits,
        completedVisits,
        expiredVisits
      ] = await Promise.all([
        prisma.visite.count({ where: dateFilter }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.PLANIFIEE } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.EN_COURS } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.TERMINEE } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.EXPIREE } })
      ]);

      return {
        totalVisits,
        plannedVisits,
        activeVisits,
        completedVisits,
        expiredVisits
      };
    } catch (error) {
      logger.error('Error fetching visit statistics:', error);
      throw new Error('Failed to fetch visit statistics');
    }
  }
}

export const visitService = new VisitService();