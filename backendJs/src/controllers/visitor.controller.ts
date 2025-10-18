import { Request, Response, NextFunction } from 'express';
import { visitorService } from '../services/visitor.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateVisitorRequest, UpdateVisitorRequest, SearchQuery, PaginatedResponse } from '../types';

export class VisitorController {
  // Créer un visiteur
  async createVisitor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const visitorData: CreateVisitorRequest = req.body;
      
      const visitor = await visitorService.createVisitor(visitorData);
      
      const response: ApiResponse = {
        success: true,
        data: visitor,
        message: 'Visitor created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create visitor failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create visitor',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir un visiteur par ID
  async getVisitorById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const visitor = await visitorService.getVisitorById(id);
      
      if (!visitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Visitor not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visitor,
        message: 'Visitor retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get visitor failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve visitor',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir tous les visiteurs avec pagination
  async getAllVisitors(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await visitorService.getVisitors(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Visitors retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all visitors failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve visitors',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour un visiteur
  async updateVisitor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData: UpdateVisitorRequest = req.body;
      
      const visitor = await visitorService.updateVisitor(id, updateData);
      
      if (!visitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Visitor not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visitor,
        message: 'Visitor updated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update visitor failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update visitor',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Supprimer un visiteur
  async deleteVisitor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await visitorService.deleteVisitor(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Visitor not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Visitor deleted successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete visitor failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete visitor',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Rechercher des visiteurs
  async searchVisitors(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await visitorService.getVisitors(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Search completed successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Search visitors failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Blacklister/déblacklister un visiteur
  async toggleBlacklist(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { estBlackliste } = req.body;
      
      const visitor = await visitorService.updateVisitor(id, { estBlackliste });
      
      if (!visitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Visitor not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: visitor,
        message: `Visitor ${estBlackliste ? 'blacklisted' : 'unblacklisted'} successfully`,
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Toggle blacklist failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to toggle blacklist status',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Recherche publique de visiteurs (pour mobile)
  async searchVisitorsPublic(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const searchTerm = req.query.search as string || '';
      
      if (!searchTerm) {
        const response: ApiResponse = {
          success: false,
          message: 'Search term is required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const query: SearchQuery = {
        page: 1,
        limit: 10,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await visitorService.getVisitors(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Visitors retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Public visitor search failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to search visitors',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Créer un visiteur (endpoint public pour mobile)
  async createVisitorPublic(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const visitorData: CreateVisitorRequest = req.body;
      
      // Vérifier que tous les champs obligatoires sont présents
      if (!visitorData.nom || !visitorData.prenom || !visitorData.email || !visitorData.telephone || !visitorData.entreprise) {
        const response: ApiResponse = {
          success: false,
          message: 'Tous les champs sont obligatoires (nom, prenom, email, telephone, entreprise)',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      // Vérifier si le visiteur existe déjà
      const existingVisitor = await visitorService.findVisitorByEmailOrPhone(visitorData.email, visitorData.telephone);
      if (existingVisitor) {
        const response: ApiResponse = {
          success: false,
          message: 'Un visiteur avec cet email ou téléphone existe déjà',
          statusCode: 409
        };
        return res.status(409).json(response);
      }
      
      const visitor = await visitorService.createVisitor(visitorData);
      
      const response: ApiResponse = {
        success: true,
        data: visitor,
        message: 'Visitor created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create visitor public failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create visitor',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const visitorController = new VisitorController();
