import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateVisiteRequest, UpdateVisiteRequest, SearchQuery, PaginatedResponse } from '../types';
import { Visite, VisitStatus } from '@prisma/client';

export class VisitService {
  // Créer une visite
  async createVisit(visitData: CreateVisiteRequest): Promise<Visite> {
    try {
      const newVisit = await prisma.visite.create({
        data: {
          visiteurId: visitData.visiteurId,
          employeId: visitData.employeId,
          dateDebut: visitData.dateDebut,
          dateFin: visitData.dateFin,
          motif: visitData.motif,
          statut: VisitStatus.PLANIFIEE,
        },
        include: {
          visiteur: true,
          employe: true,
          badges: true
        }
      });
      logger.info('Visit created:', newVisit);
      return newVisit;
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
          badges: true
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
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { motif: { contains: search, mode: 'insensitive' as const } },
          { visiteur: { nom: { contains: search, mode: 'insensitive' as const } } },
          { visiteur: { prenom: { contains: search, mode: 'insensitive' as const } } },
          { employe: { nom: { contains: search, mode: 'insensitive' as const } } },
          { employe: { prenom: { contains: search, mode: 'insensitive' as const } } }
        ]
      } : {};

      const [visits, total] = await Promise.all([
        prisma.visite.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            visiteur: true,
            employe: true,
            badges: true
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
      const updatedVisit = await prisma.visite.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: true,
          badges: true
        }
      });
      logger.info('Visit updated:', updatedVisit);
      return updatedVisit;
    } catch (error) {
      logger.error(`Error updating visit with ID ${id}:`, error);
      throw new Error('Failed to update visit');
    }
  }

  // Supprimer une visite
  async deleteVisit(id: string): Promise<boolean> {
    try {
      await prisma.visite.delete({
        where: { id }
      });
      logger.info(`Visit with ID ${id} deleted`);
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
          badges: true
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
      const visit = await prisma.visite.update({
        where: { id },
        data: {
          statut: VisitStatus.TERMINEE,
          dateFin: new Date(),
          updatedAt: new Date()
        },
        include: {
          visiteur: true,
          employe: true,
          badges: true
        }
      });
      logger.info('Visit checked out:', visit);
      return visit;
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
            employe: true,
            badges: true
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
        cancelledVisits
      ] = await Promise.all([
        prisma.visite.count({ where: dateFilter }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.PLANIFIEE } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.EN_COURS } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.TERMINEE } }),
        prisma.visite.count({ where: { ...dateFilter, statut: VisitStatus.ANNULEE } })
      ]);

      return {
        totalVisits,
        plannedVisits,
        activeVisits,
        completedVisits,
        cancelledVisits
      };
    } catch (error) {
      logger.error('Error fetching visit statistics:', error);
      throw new Error('Failed to fetch visit statistics');
    }
  }
}

export const visitService = new VisitService();