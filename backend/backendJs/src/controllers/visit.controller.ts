import { Request, Response, NextFunction } from 'express';
import { visitService } from '../services/visit.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateVisiteRequest, UpdateVisiteRequest, SearchQuery } from '../types';

export class VisitController {
  // Créer une visite
  async createVisit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const visitData: CreateVisiteRequest = req.body;
      
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
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
}

export const visitController = new VisitController();
