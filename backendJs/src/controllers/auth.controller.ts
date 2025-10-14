import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import { ApiResponse, LoginRequest, CreateUserRequest } from '../types';
import { authenticateToken, requireAdmin, ROLES, AuthenticatedUser } from '../middlewares/auth';
import { prisma } from '../config/database';
import { auditService } from '../services/audit.service';
import bcrypt from 'bcryptjs';
import config from '../config/env';

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
      
      let statusCode = 401;
      let errorMessage = error.message || 'Erreur de connexion';
      
      // Gérer les erreurs de rate limiting
      if (error.message && error.message.includes('Too many')) {
        statusCode = 429;
        errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
      }
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage,
        statusCode: statusCode
      };

      return res.status(statusCode).json(response);
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
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const authenticatedUser = req.user as AuthenticatedUser | undefined;
      const userId = authenticatedUser?.id;
      
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
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const authenticatedUser = req.user as AuthenticatedUser | undefined;
      const userId = authenticatedUser?.id;
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
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const authenticatedUser = req.user as AuthenticatedUser | undefined;
      const userId = authenticatedUser?.id;
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

  // Create user with specific role (Admin only)
  async createUserWithRole(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      // Validate role
      if (!userData.role || !Object.values(ROLES).includes(userData.role)) {
        const response: ApiResponse = {
          success: false,
          message: 'Role must be ADMIN or RECEPTIONNISTE',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      const user = await authService.createUserWithRole(userData);

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
        message: `User created successfully with role ${user.role}`,
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create user with role failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create user',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Create admin user (Admin only)
  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      const user = await authService.createAdmin(userData);

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

  // Create receptionist user (Admin only)
  async createReceptionist(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userData = req.body;

      const user = await authService.createReceptionist(userData);

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

  // Get all users (Admin only)
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const users = await authService.getAllUsers();

      const response: ApiResponse = {
        success: true,
        data: users.map(user => ({
          id: user.id,
          login: user.login,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
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

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        const response: ApiResponse = {
          success: false,
          error: 'Email is required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        const response: ApiResponse = {
          success: true,
          message: 'Si cette adresse email existe dans notre système, vous recevrez un email avec les instructions de réinitialisation',
          statusCode: 200
        };
        return res.status(200).json(response);
      }

      // Generate temporary password
      const tempPassword = AuthController.generateTemporaryPassword();
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

      // Update user with temporary password and reset flag
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedTempPassword,
          passwordResetRequired: true,
          updatedAt: new Date()
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUEST',
          entityType: 'AUTH',
          details: `User requested password reset. Temporary password: ${tempPassword}`
        }
      });

      logger.info(`Password reset requested for email: ${email}. Temporary password: ${tempPassword}`);
      
      const response: ApiResponse = {
        success: true,
        data: {
          tempPassword: tempPassword,
          userEmail: user.email
        },
        message: `Mot de passe temporaire généré: ${tempPassword}. Vous devrez définir un nouveau mot de passe lors de votre prochaine connexion.`,
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Forgot password failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Erreur lors de la demande de réinitialisation',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Generate temporary password (helper method)
  private static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Reset user password by admin
  async resetUserPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const adminId = (req as any).user?.id;

      if (!adminId) {
        const response: ApiResponse = {
          success: false,
          error: 'Admin authentication required',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      const result = await authService.resetUserPassword(userId, adminId);

      const response: ApiResponse = {
        success: true,
        data: {
          tempPassword: result.tempPassword,
          userEmail: result.userEmail
        },
        message: `Mot de passe réinitialisé avec succès. Mot de passe temporaire: ${result.tempPassword}. L'utilisateur devra définir un nouveau mot de passe lors de sa prochaine connexion.`,
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Reset user password failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erreur lors de la réinitialisation du mot de passe',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Set new password after reset
  async setNewPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID and new password are required',
          statusCode: 400
        };
        return res.status(400).json(response);
      }

      await authService.setNewPassword(userId, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Nouveau mot de passe défini avec succès',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Set new password failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erreur lors de la définition du nouveau mot de passe',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const adminId = (req as any).user?.id;

      if (!adminId) {
        const response: ApiResponse = {
          success: false,
          error: 'Admin authentication required',
          statusCode: 401
        };
        return res.status(401).json(response);
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'Utilisateur non trouvé',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      // Delete user
      await prisma.user.delete({
        where: { id: userId }
      });

      // Log the action
      await auditService.logAction({
        userId: adminId,
        action: 'DELETE',
        entityType: 'USER',
        entityId: userId,
        details: `Admin deleted user ${user.email}`
      });

      const response: ApiResponse = {
        success: true,
        message: 'Utilisateur supprimé avec succès',
        statusCode: 200
      };

      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete user failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur',
        statusCode: 500
      };

      return res.status(500).json(response);
    }
  }

}

export const authController = new AuthController();
