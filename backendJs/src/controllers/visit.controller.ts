import { Request, Response, NextFunction } from 'express';
import { visitService } from '../services/visit.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateVisiteRequest, UpdateVisiteRequest, SearchQuery } from '../types';
import { prisma } from '../config/database';

export class VisitController {
  // Confirmer une visite par le visiteur (publique - pour les visiteurs mobiles)
  async confirmVisitByVisitor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { visitorName } = req.body; // Nom du visiteur qui confirme
      
      const result = await visitService.confirmVisitByVisitor(id, visitorName);
      
      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      logger.info('Visit confirmed by visitor', {
        visitId: id,
        visitorName,
        service: 'guesthub-backend'
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error confirming visit by visitor', {
        error: error instanceof Error ? error.message : 'Unknown error',
        visitId: req.params.id,
        service: 'guesthub-backend'
      });
      next(error);
    }
  }

  // Créer une visite (publique - pour les visiteurs mobiles)
  async createVisitPublic(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const visitData: CreateVisiteRequest = req.body;
      
      // Vérifier si le visiteur est blacklisté
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitData.visiteurId },
        select: { 
          id: true, 
          nom: true, 
          prenom: true, 
          estBlackliste: true,
          email: true,
          telephone: true
        }
      });

      if (!visitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Visiteur non trouvé',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      if (visitor.estBlackliste) {
        const response: ApiResponse = {
          success: false,
          message: `Accès refusé: ${visitor.prenom} ${visitor.nom} est blacklisté. Veuillez contacter les responsables de l'entreprise.`,
          statusCode: 403,
          data: {
            visitor: {
              nom: visitor.nom,
              prenom: visitor.prenom,
              estBlackliste: true
            }
          }
        };
        return res.status(403).json(response);
      }

      // Vérifier si le visiteur a déjà une visite en cours (non expirée)
      const activeVisit = await prisma.visite.findFirst({
        where: {
          visiteurId: visitData.visiteurId,
          statut: {
            in: ['PLANIFIEE', 'EN_COURS']
          },
          // Seulement les visites qui ne sont pas encore expirées
          OR: [
            {
              dateFin: {
                gte: new Date() // Date de fin dans le futur
              }
            },
            {
              dateFin: null // Pas de date de fin définie
            }
          ]
        },
        select: {
          id: true,
          statut: true,
          dateDebut: true,
          dateFin: true,
          motif: true
        }
      });

      if (activeVisit) {
        const response: ApiResponse = {
          success: false,
          message: `Vous avez déjà une visite ${activeVisit.statut.toLowerCase()} (${activeVisit.motif}). Impossible de créer une nouvelle visite.`,
          statusCode: 409
        };
        return res.status(409).json(response);
      }
      
      const visit = await visitService.createVisit(visitData);
      
      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Visit created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create visit failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create visit',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Créer une visite (authentifiée)
  async createVisit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const visitData: CreateVisiteRequest = req.body;
      
      // Vérifier si le visiteur est blacklisté
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitData.visiteurId },
        select: { 
          id: true, 
          nom: true, 
          prenom: true, 
          estBlackliste: true,
          email: true
        }
      });

      if (!visitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Visiteur non trouvé',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      if (visitor.estBlackliste) {
        const response: ApiResponse = {
          success: false,
          message: `Impossible de créer une visite pour ${visitor.prenom} ${visitor.nom} - ce visiteur est blacklisté`,
          statusCode: 403
        };
        return res.status(403).json(response);
      }

      // Vérifier si le visiteur a déjà une visite en cours (non expirée)
      const activeVisit = await prisma.visite.findFirst({
        where: {
          visiteurId: visitData.visiteurId,
          statut: {
            in: ['PLANIFIEE', 'EN_COURS']
          },
          // Seulement les visites qui ne sont pas encore expirées
          OR: [
            {
              dateFin: {
                gte: new Date() // Date de fin dans le futur
              }
            },
            {
              dateFin: null // Pas de date de fin définie
            }
          ]
        },
        select: {
          id: true,
          statut: true,
          dateDebut: true,
          dateFin: true,
          motif: true
        }
      });

      if (activeVisit) {
        const response: ApiResponse = {
          success: false,
          message: `${visitor.prenom} ${visitor.nom} a déjà une visite ${activeVisit.statut.toLowerCase()} (${activeVisit.motif}). Impossible de créer une nouvelle visite.`,
          statusCode: 409
        };
        return res.status(409).json(response);
      }
      
      const visit = await visitService.createVisit(visitData);
      
      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Visit created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create visit failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create visit',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir une visite par ID
  async getVisitById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const visit = await visitService.getVisitById(id);
      
      if (!visit) {
        const response: ApiResponse = {
          success: false,
          message: 'Visit not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Visit retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get visit failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve visit',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir toutes les visites avec pagination
  async getAllVisits(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Si aucun paramètre de pagination n'est fourni, récupérer toutes les visites
      const hasPagination = req.query.page || req.query.limit;
      
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: hasPagination ? (parseInt(req.query.limit as string) || 10) : 1000, // Limite élevée si pas de pagination
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        visiteurId: req.query.visiteurId as string,
        statut: req.query.statut as string
      };

      const result = await visitService.getAllVisits(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Visits retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all visits failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve visits',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour une visite
  async updateVisit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData: UpdateVisiteRequest = req.body;
      
      const visit = await visitService.updateVisit(id, updateData);
      
      if (!visit) {
        const response: ApiResponse = {
          success: false,
          message: 'Visit not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Visit updated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update visit failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update visit',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Supprimer une visite
  async deleteVisit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await visitService.deleteVisit(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Visit not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Visit deleted successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete visit failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete visit',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Check-in d'une visite
  async checkIn(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const visit = await visitService.checkIn(id);
      
      if (!visit) {
        const response: ApiResponse = {
          success: false,
          message: 'Visit not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Check-in successful',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Check-in failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Check-in failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Check-out d'une visite
  async checkOut(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const visit = await visitService.checkOut(id);
      
      if (!visit) {
        const response: ApiResponse = {
          success: false,
          message: 'Visit not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visit,
        message: 'Check-out successful',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Check-out failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Check-out failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les visites en cours
  async getActiveVisits(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await visitService.getActiveVisits(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Active visits retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get active visits failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve active visits',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les statistiques des visites
  async getVisitStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await visitService.getVisitStats(
        startDate as string,
        endDate as string
      );
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Visit statistics retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get visit stats failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve visit statistics',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les visites planifiées d'un visiteur (publique - pour les visiteurs mobiles)
  async getScheduledVisitsByVisitor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { visiteurId } = req.params;
      
      const visits = await prisma.visite.findMany({
        where: {
          visiteurId: visiteurId,
          statut: 'PLANIFIEE'
        },
        include: {
          visiteur: {
            select: {
              nom: true,
              prenom: true,
              email: true
            }
          },
          employe: {
            select: {
              nom: true,
              prenom: true,
              department: {
                select: {
                  nom: true
                }
              }
            }
          },
          badge: {
            select: {
              qrCode: true,
              status: true
            }
          }
        },
        orderBy: {
          dateDebut: 'asc'
        }
      });

      const response: ApiResponse = {
        success: true,
        data: {
          visits: visits,
          count: visits.length
        },
        message: 'Visites planifiées récupérées avec succès',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la récupération des visites planifiées:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la récupération des visites planifiées',
        statusCode: 500
      };
      return res.status(500).json(response);
    }
  }

  // Obtenir les visites récentes (pour les notifications)
  async getRecentVisits(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { since } = req.query;
      
      if (!since) {
        const response: ApiResponse = {
          success: false,
          message: 'Paramètre "since" requis',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const sinceDate = new Date(since as string);
      
        const recentVisits = await prisma.visite.findMany({
          where: {
            // Utiliser confirmedAt pour les visites confirmées, createdAt pour les autres
            OR: [
              {
                confirmByVisitor: {
                  not: null
                },
                confirmedAt: {
                  gte: sinceDate
                }
              },
              {
                statut: 'EN_COURS',
                createdAt: {
                  gte: sinceDate
                }
              }
            ],
            statut: {
              in: ['PLANIFIEE', 'EN_COURS'] // Visites planifiées confirmées ou en cours
            }
          },
        include: {
          visiteur: {
            select: {
              nom: true,
              prenom: true,
              email: true
            }
          },
          employe: {
            select: {
              nom: true,
              prenom: true,
              department: {
                select: {
                  nom: true
                }
              }
            }
          },
          badge: {
            select: {
              qrCode: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Visites récentes récupérées avec succès',
        data: {
          visits: recentVisits,
          count: recentVisits.length
        },
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la récupération des visites récentes:', error);
      return next(error);
    }
  }
}

export const visitController = new VisitController();
