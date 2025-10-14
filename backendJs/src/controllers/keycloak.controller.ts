import { Request, Response, NextFunction } from 'express';
import { keycloakService } from '../services/keycloak.service';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';
// import { protectRoute } from '../config/keycloak'; // Temporarily disabled

export class KeycloakController {
  // Obtenir les informations de l'utilisateur connecté
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: req.user,
        message: 'User information retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get current user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve user information',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir tous les utilisateurs (Admin seulement)
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await keycloakService.getAllUsers(limit, offset);

      const response: ApiResponse = {
        success: true,
        data: {
          users,
          pagination: {
            limit,
            offset,
            total: users.length
          }
        },
        message: 'Users retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all users failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve users',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { query } = req.query;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!query) {
        const response: ApiResponse = {
          success: false,
          message: 'Search query is required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const users = await keycloakService.searchUsers(query as string, limit);

      const response: ApiResponse = {
        success: true,
        data: {
          users,
          query,
          total: users.length
        },
        message: 'Search completed successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Search users failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir un utilisateur par ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await keycloakService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get user by ID failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Créer un utilisateur avec rôle
  async createUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      // Valider que le rôle est valide
      if (!userData.role || !['ADMIN', 'RECEPTIONNISTE'].includes(userData.role)) {
        const response: ApiResponse = {
          success: false,
          message: 'Role must be ADMIN or RECEPTIONNISTE',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const user = await keycloakService.createUser(userData);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to create user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: `User created successfully with role ${userData.role}`,
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Créer un administrateur
  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      const user = await keycloakService.createAdmin(userData);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to create admin user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Admin user created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create admin failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create admin user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Créer un réceptionniste
  async createReceptionist(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      const user = await keycloakService.createReceptionist(userData);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to create receptionist user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Receptionist user created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create receptionist failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create receptionist user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await keycloakService.updateUser(id, updateData);

      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to update user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Assigner des rôles à un utilisateur
  async assignRoles(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      if (!roles || !Array.isArray(roles)) {
        const response: ApiResponse = {
          success: false,
          message: 'Roles array is required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const success = await keycloakService.assignRolesToUser(id, roles);

      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to assign roles',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Roles assigned successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Assign roles failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to assign roles',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Désactiver un utilisateur
  async disableUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const success = await keycloakService.disableUser(id);

      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to disable user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'User disabled successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Disable user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to disable user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Activer un utilisateur
  async enableUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const success = await keycloakService.enableUser(id);

      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to enable user',
          statusCode: 500
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'User enabled successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Enable user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to enable user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Vérifier la connexion Keycloak
  async checkConnection(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const isConnected = await keycloakService.checkConnection();

      const response: ApiResponse = {
        success: isConnected,
        data: { connected: isConnected },
        message: isConnected ? 'Keycloak connection successful' : 'Keycloak connection failed',
        statusCode: isConnected ? 200 : 503
      };

      return res.status(response.statusCode).json(response);
    } catch (error: any) {
      logger.error('Check Keycloak connection failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Keycloak connection check failed',
        statusCode: 503
      };
      return res.status(503).json(response);
    }
  }
}

export const keycloakController = new KeycloakController();
