import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';
import { auditService } from '../services/audit.service';

// Interface pour l'utilisateur authentifié
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONNISTE';
  firstName: string;
  lastName: string;
}

// Déclaration de module pour étendre Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Rôles disponibles dans le système
export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTIONNISTE: 'RECEPTIONNISTE'
} as const;

// Middleware d'authentification JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: 'Access token required',
      statusCode: 401
    };
    res.status(401).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    // Vérifier que le token contient les informations nécessaires
    if (!decoded.id || !decoded.email || !decoded.role) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid token format',
        statusCode: 401
      };
      res.status(401).json(response);
      return;
    }

    // Vérifier que le rôle est valide
    if (!Object.values(ROLES).includes(decoded.role)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user role',
        statusCode: 401
      };
      res.status(401).json(response);
      return;
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || ''
    };

    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token',
      statusCode: 401
    };
    res.status(401).json(response);
  }
};

// Middleware pour vérifier les rôles spécifiques
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required',
        statusCode: 401
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required roles: ${roles.join(', ')}`);
      const response: ApiResponse = {
        success: false,
        message: 'Insufficient permissions',
        statusCode: 403
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

// Middleware pour les administrateurs uniquement
export const requireAdmin = requireRole([ROLES.ADMIN]);

// Middleware pour les réceptionnistes et administrateurs
export const requireReceptionistOrAdmin = requireRole([ROLES.RECEPTIONNISTE, ROLES.ADMIN]);

// Middleware pour logger les tentatives d'accès
export const logAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.user) {
    logger.info('Authenticated access', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Enregistrer l'accès dans la base de données
    try {
      await auditService.logAccess(
        req.user.id,
        req.originalUrl,
        req.method,
        `User ${req.user.email} accessed ${req.method} ${req.originalUrl}`,
        req.ip,
        req.get('User-Agent')
      );
    } catch (error) {
      logger.error('Failed to log access:', error);
    }
  } else {
    logger.info('Anonymous access', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  next();
};

// Fonction utilitaire pour vérifier si un utilisateur a un rôle spécifique
export const hasRole = (user: AuthenticatedUser | undefined, role: string): boolean => {
  return user?.role === role;
};

// Fonction utilitaire pour vérifier si un utilisateur a un des rôles spécifiés
export const hasAnyRole = (user: AuthenticatedUser | undefined, roles: string[]): boolean => {
  return user ? roles.includes(user.role) : false;
};
