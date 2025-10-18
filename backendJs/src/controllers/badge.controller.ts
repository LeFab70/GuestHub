import { Request, Response, NextFunction } from 'express';
import { badgeService } from '../services/badge.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateBadgeRequest, UpdateBadgeRequest, SearchQuery } from '../types';

export class BadgeController {
  // Créer un badge
  async createBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const badgeData: CreateBadgeRequest = req.body;
      
      const badge = await badgeService.createBadge(badgeData);
      
      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir un badge par ID
  async getBadgeById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const badge = await badgeService.getBadgeById(id);
      
      if (!badge) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir tous les badges avec pagination
  async getAllBadges(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await badgeService.getAllBadges(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Badges retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all badges failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve badges',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour un badge
  async updateBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData: UpdateBadgeRequest = req.body;
      
      const badge = await badgeService.updateBadge(id, updateData);
      
      if (!badge) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge updated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Supprimer un badge
  async deleteBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await badgeService.deleteBadge(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Badge deleted successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Scanner un badge (lecture QR)
  async scanBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { qrCode } = req.body;
      
      const badge = await badgeService.scanBadge(qrCode, req.user?.id);
      
      if (!badge) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found or invalid QR code',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge scanned successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Scan badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to scan badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Activer un badge
  async activateBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const badge = await badgeService.activateBadge(id);
      
      if (!badge) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge activated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Activate badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to activate badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Désactiver un badge
  async deactivateBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const badge = await badgeService.deactivateBadge(id);
      
      if (!badge) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: badge,
        message: 'Badge deactivated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Deactivate badge failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to deactivate badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les badges actifs
  async getActiveBadges(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await badgeService.getActiveBadges(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Active badges retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get active badges failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve active badges',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Générer un QR code pour un badge
  async generateQRCode(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const qrCode = await badgeService.generateQRCode(id);
      
      if (!qrCode) {
        const response: ApiResponse = {
          success: false,
          message: 'Badge not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: { qrCode },
        message: 'QR code generated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Generate QR code failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to generate QR code',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Imprimer un badge
  async printBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const printedByUserId = req.user?.id;
      const badge = await badgeService.printBadge(id, printedByUserId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Badge imprimé avec succès',
        data: badge,
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Erreur lors de l\'impression du badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Marquer un badge comme en utilisation
  async useBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const badge = await badgeService.useBadge(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Badge marqué comme en utilisation',
        data: badge,
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Erreur lors de l\'utilisation du badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Marquer un badge comme rendu
  async returnBadge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const badge = await badgeService.returnBadge(id, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Badge marqué comme rendu',
        data: badge,
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Erreur lors du retour du badge',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const badgeController = new BadgeController();
