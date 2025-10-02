import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import { ApiResponse, LoginRequest, CreateUserRequest, AuthenticatedRequest } from '../types';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      const user = await authService.register(userData);
      
      const response: ApiResponse = {
        success: true,
        data: {
          id: user.id,
          login: user.login,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        message: 'User registered successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Registration failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Registration failed',
        statusCode: 400
      };

      return res.status(400).json(response);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const loginData: LoginRequest = req.body;
      
      const result = await authService.login(loginData);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Login failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Login failed',
        statusCode: 401
      };

      return res.status(401).json(response);
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Refresh token is required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const result = await authService.refreshToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Token refresh failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Token refresh failed',
        statusCode: 401
      };

      return res.status(401).json(response);
    }
  }

  // Get current user profile
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User not authenticated',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      const user = await authService.getUserById(userId);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: user.id,
          login: user.login,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get profile failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Get profile failed',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Update user profile
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      const updateData = req.body;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User not authenticated',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      // Remove sensitive fields that shouldn't be updated through this endpoint
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await authService.updateProfile(userId, updateData);
      
      const response: ApiResponse = {
        success: true,
        data: {
          id: user.id,
          login: user.login,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        message: 'Profile updated successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update profile failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Update profile failed',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Change password
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User not authenticated',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      if (newPassword !== confirmPassword) {
        const response: ApiResponse = {
          success: false,
          error: 'New password and confirm password do not match',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      
      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Change password failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Change password failed',
        statusCode: 400
      };

      return res.status(400).json(response);
    }
  }

  // Logout (client-side token removal)
  async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Logout failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Logout failed',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Verify token
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse = {
          success: false,
          error: 'No token provided',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      const token = authHeader.substring(7);
      const decoded = authService.verifyAccessToken(token);
      
      if (!decoded) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid token',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: { valid: true, user: decoded },
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Token verification failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Token verification failed',
        statusCode: 401
      };

      return res.status(401).json(response);
    }
  }
}

export const authController = new AuthController();
