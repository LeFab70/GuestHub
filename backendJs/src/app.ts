import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { database } from './config/database';
import { logger, requestLogger, errorLogger } from './config/logger';
import config from './config/env';
import { setupSwagger } from './config/swagger';
// import keycloak, { extractUserInfo, logAccess } from './config/keycloak'; // Temporarily disabled
import {
  corsOptions,
  helmetConfig,
  compressionConfig,
  securityHeaders,
  sanitizeRequest,
  generalRateLimit,
  errorHandler,
  notFoundHandler
} from './middlewares/security';

// Import routes
import authRoutes from './routes/auth.routes';
import visitorRoutes from './routes/visitor.routes';
import visitRoutes from './routes/visit.routes';
import badgeRoutes from './routes/badge.routes';
import employeeRoutes from './routes/employee.routes';
import departmentRoutes from './routes/department.routes';
import auditRoutes from './routes/audit.routes';
import initRoutes from './routes/init.routes';
// import keycloakRoutes from './routes/keycloak.routes'; // Temporarily disabled

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmetConfig);
    this.app.use(securityHeaders);
    this.app.use(sanitizeRequest);

    // CORS
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compressionConfig);

    // Rate limiting
    this.app.use(generalRateLimit);

    // Session configuration for Keycloak
    this.app.use(session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Keycloak middleware - temporarily disabled
    // this.app.use(keycloak.middleware());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    this.app.use(cookieParser());

    // User info extraction and logging - temporarily disabled
    // this.app.use(extractUserInfo);
    // this.app.use(logAccess);

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));
    this.app.use(requestLogger);

    // Trust proxy (for rate limiting and IP detection)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        
        res.status(200).json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.NODE_ENV,
          database: dbHealth ? 'Connected' : 'Disconnected',
          version: process.env.npm_package_version || '1.0.0'
        });
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          error: 'Service unavailable'
        });
      }
    });

    // API routes
    this.app.use('/api/init', initRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/visitors', visitorRoutes);
    this.app.use('/api/visits', visitRoutes);
    this.app.use('/api/badges', badgeRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/departments', departmentRoutes);
    this.app.use('/api/audit', auditRoutes);
    // this.app.use('/api/keycloak', keycloakRoutes); // Temporarily disabled

    // Setup Swagger UI
    setupSwagger(this.app);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'GuestHub API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health'
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Error handling middleware
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(config.PORT, config.HOST, () => {
        logger.info(`Server running on http://${config.HOST}:${config.PORT}`);
        logger.info(`Environment: ${config.NODE_ENV}`);
        logger.info(`API Documentation: http://${config.HOST}:${config.PORT}/api-docs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown);
      process.on('SIGINT', this.gracefulShutdown);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    try {
      // Close database connection
      await database.disconnect();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };
}

export default App;