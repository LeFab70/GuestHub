import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import config from '../config/env';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        nom: string;
        prenom: string;
      };
    }
  }
}

// JWT Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Token verification failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      return res.status(401).json({
        success: false,
        error: 'Token d\'accès requis',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        nom: true,
        prenom: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      logger.warn('Token verification failed: User not found or inactive', {
        userId: decoded.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
        message: 'Votre session a expiré ou votre compte a été désactivé'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom
    };

    logger.info('Authenticated access', {
      userId: user.id,
      email: user.email,
      role: user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error: any) {
    logger.error('Token verification failed', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
        message: 'Token d\'authentification invalide'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification',
      message: 'Une erreur est survenue lors de la vérification de votre identité'
    });
  }
};

// Admin role requirement middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Vous devez être connecté pour accéder à cette ressource'
    });
  }

  if (req.user.role !== 'ADMIN') {
    logger.warn('Admin access denied', {
      userId: req.user.id,
      userRole: req.user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
      message: 'Vous devez être administrateur pour accéder à cette ressource'
    });
  }

  next();
};

// Receptionist role requirement middleware
export const requireReceptionist = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Vous devez être connecté pour accéder à cette ressource'
    });
  }

  if (req.user.role !== 'RECEPTIONNISTE' && req.user.role !== 'ADMIN') {
    logger.warn('Receptionist access denied', {
      userId: req.user.id,
      userRole: req.user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
      message: 'Vous devez être réceptionniste ou administrateur pour accéder à cette ressource'
    });
  }

  next();
};

// Receptionist or Admin role requirement middleware
export const requireReceptionistOrAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Vous devez être connecté pour accéder à cette ressource'
    });
  }

  if (req.user.role !== 'RECEPTIONNISTE' && req.user.role !== 'ADMIN') {
    logger.warn('Receptionist or Admin access denied', {
      userId: req.user.id,
      userRole: req.user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
      message: 'Vous devez être réceptionniste ou administrateur pour accéder à cette ressource'
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          nom: true,
          prenom: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom
        };
      }
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional auth failed', { error: (error as Error).message });
  }

  next();
};

// Audit logging middleware
export const logAccess = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    // Log the access
    prisma.auditLog.create({
      data: {
        action: 'ACCESS',
        entityType: req.originalUrl,
        entityId: null,
        details: `${req.method} ${req.originalUrl}`,
        userId: req.user.id
      }
    }).catch(error => {
      logger.error('Failed to create audit log', { error: error.message });
    });

    logger.info('Audit log created', {
      userId: req.user.id,
      action: 'ACCESS',
      entityType: req.originalUrl
    });
  }

  next();
};
