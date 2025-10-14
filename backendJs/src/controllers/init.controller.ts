import { Request, Response, NextFunction } from 'express';
import { initService } from '../services/init.service';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

export class InitController {
  // Vérifier le statut d'initialisation
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const status = await initService.getInitStatus();

      const response: ApiResponse = {
        success: true,
        data: status,
        message: 'Initialization status retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get init status failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to get initialization status',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Initialiser l'application avec le premier admin
  async initialize(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const adminData = req.body;

      // Validation des données requises
      if (!adminData.login || !adminData.email || !adminData.password || !adminData.nom || !adminData.prenom) {
        const response: ApiResponse = {
          success: false,
          message: 'All fields are required: login, email, password, nom, prenom',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      // Vérifier si déjà initialisé
      if (await initService.isInitialized()) {
        const response: ApiResponse = {
          success: false,
          message: 'Application already initialized',
          statusCode: 409
        };
        return res.status(409).json(response);
      }

      const success = await initService.initializeApp(adminData);

      if (success) {
        const response: ApiResponse = {
          success: true,
          data: {
            message: 'Application initialized successfully',
            adminEmail: adminData.email
          },
          message: 'Application initialized successfully with first admin',
          statusCode: 201
        };
        return res.status(201).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to initialize application',
          statusCode: 500
        };
        return res.status(500).json(response);
      }
    } catch (error: any) {
      logger.error('Initialize app failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to initialize application',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Réinitialiser l'application (DANGEREUX - supprime tous les utilisateurs)
  async reset(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { confirm } = req.body;

      if (confirm !== 'RESET_ALL_DATA') {
        const response: ApiResponse = {
          success: false,
          message: 'Reset confirmation required. Send { "confirm": "RESET_ALL_DATA" }',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const success = await initService.resetApp();

      if (success) {
        const response: ApiResponse = {
          success: true,
          data: {
            message: 'Application reset successfully - all users deleted'
          },
          message: 'Application reset successfully',
          statusCode: 200
        };
        return res.status(200).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to reset application',
          statusCode: 500
        };
        return res.status(500).json(response);
      }
    } catch (error: any) {
      logger.error('Reset app failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to reset application',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const initController = new InitController();
