import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { logger } from '../config/logger';
import config from '../config/env';

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // En mode développement, autoriser localhost
    if (config.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = config.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: config.CORS_CREDENTIALS,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Too many requests from this IP, please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        error: 'Trop de tentatives',
        message: message || 'Trop de tentatives de connexion. Veuillez réessayer plus tard',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General rate limiter - plus permissif pour le développement
export const generalRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes au lieu de 15
  200, // 200 requêtes au lieu de 100
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for auth endpoints (login/register only)
export const authRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes (réduit de 15 à 5 minutes)
  config.DISABLE_RATE_LIMIT ? 1000 : 100, // 1000 attempts si rate limiting désactivé, sinon 100 (augmenté de 50 à 100)
  'Trop de tentatives de connexion. Veuillez réessayer plus tard'
);

// More permissive rate limiter for general API usage
export const apiRateLimit = createRateLimit(
  2 * 60 * 1000, // 2 minutes
  500, // 500 requests per 2 minutes
  'Too many API requests, please try again later'
);

// Very permissive rate limiter for dashboard endpoints
export const dashboardRateLimit = createRateLimit(
  1 * 60 * 1000, // 1 minute
  1000, // 1000 requests per minute (très permissif pour les dashboards)
  'Too many dashboard requests, please try again later'
);

// File upload rate limiter
export const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later'
);

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Compression configuration
export const compressionConfig = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  next();
};

// Object sanitization helper
const sanitizeObject = (obj: any): void => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
};

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (allowedIPs.includes(clientIP || '')) {
      next();
    } else {
      logger.warn('IP not whitelisted', { ip: clientIP, url: req.originalUrl });
      res.status(403).json({
        error: 'Forbidden',
        message: 'Your IP address is not allowed to access this resource'
      });
      return;
    }
  };
};

// Request size limiter
export const requestSizeLimit = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    
    if (contentLength > maxSize) {
      logger.warn('Request too large', {
        contentLength,
        maxSize,
        ip: req.ip,
        url: req.originalUrl
      });
      
      res.status(413).json({
        error: 'Payload too large',
        message: `Request size exceeds maximum allowed size of ${maxSize} bytes`
      });
      return;
    }
    
    next();
  };
};

// API key middleware
export const apiKeyAuth = (validKeys: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.get('X-API-Key') || req.query.apiKey as string;
    
    if (!apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required'
      });
      return;
    }
    
    if (!validKeys.includes(apiKey)) {
      logger.warn('Invalid API key', { apiKey, ip: req.ip });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
      return;
    }
    
    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('content-length')
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Error handling middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = config.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack })
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
