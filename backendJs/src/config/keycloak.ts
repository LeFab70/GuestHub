import KeycloakConnect from 'keycloak-connect';
import { Request, Response, NextFunction } from 'express';
import config from './env';
import { logger } from './logger';

// Configuration Keycloak
const keycloakConfig = {
  realm: config.KEYCLOAK_REALM,
  'auth-server-url': config.KEYCLOAK_AUTH_SERVER_URL,
  'ssl-required': 'external',
  resource: config.KEYCLOAK_CLIENT_ID,
  'verify-token-audience': true,
  credentials: {
    secret: config.KEYCLOAK_CLIENT_SECRET
  },
  'confidential-port': 0,
  'policy-enforcer': {}
};

// Créer l'instance Keycloak
const keycloak = new KeycloakConnect({}, keycloakConfig);

// Déclaration de module pour étendre Express Request avec Keycloak
// Temporarily disabled - conflicts with AuthenticatedUser
/*
declare global {
  namespace Express {
    interface Request {
      user?: KeycloakUser;
      kauth?: {
        grant?: {
          access_token: {
            content: {
              sub: string;
              preferred_username: string;
              email: string;
              given_name: string;
              family_name: string;
              realm_access?: {
                roles: string[];
              };
              iss: string;
            };
          };
        };
      };
    }
  }
}
*/

// Interface pour l'utilisateur
export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  realm: string;
}

// Middleware de protection des routes
// Temporarily disabled - conflicts with AuthenticatedUser
/*
export const protectRoute = (roles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.kauth || !req.kauth.grant) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        statusCode: 401
      });
    }

    // Vérifier les rôles si spécifiés
    if (roles && roles.length > 0) {
      const userRoles = req.kauth.grant.access_token.content.realm_access?.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          statusCode: 403
        });
      }
    }

    next();
  };
};
*/

// Middleware pour extraire les informations utilisateur
// Temporarily disabled - conflicts with AuthenticatedUser
/*
export const extractUserInfo = (req: Request, res: Response, next: NextFunction) => {
  if (req.kauth && req.kauth.grant) {
    const token = req.kauth.grant.access_token;
    req.user = {
      id: token.content.sub,
      username: token.content.preferred_username,
      email: token.content.email,
      firstName: token.content.given_name,
      lastName: token.content.family_name,
      roles: token.content.realm_access?.roles || [],
      realm: token.content.iss
    };
  }
  next();
};
*/

// Middleware pour logger les tentatives d'accès
// Temporarily disabled - conflicts with AuthenticatedUser
/*
export const logAccess = (req: Request, res: Response, next: NextFunction) => {
  if (req.kauth && req.kauth.grant) {
    const user = req.user;
    logger.info('Authenticated access', {
      userId: user?.id,
      username: user?.username,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  next();
};
*/

// Fonction pour vérifier si un utilisateur a un rôle spécifique
export const hasRole = (user: any, role: string): boolean => {
  return user?.roles?.includes(role) || false;
};

// Fonction pour vérifier si un utilisateur a un des rôles spécifiés
export const hasAnyRole = (user: any, roles: string[]): boolean => {
  return roles.some(role => hasRole(user, role));
};

// Fonction pour obtenir les informations utilisateur depuis le token
// Temporarily disabled - conflicts with AuthenticatedUser
/*
export const getUserFromToken = (req: Request) => {
  if (req.kauth && req.kauth.grant) {
    const token = req.kauth.grant.access_token;
    return {
      id: token.content.sub,
      username: token.content.preferred_username,
      email: token.content.email,
      firstName: token.content.given_name,
      lastName: token.content.family_name,
      roles: token.content.realm_access?.roles || [],
      realm: token.content.iss
    };
  }
  return null;
};
*/

export default keycloak;
