import 'reflect-metadata';
import App from './app';
import { logger } from './config/logger';
import config from './config/env';
import { VisitExpirationService } from './services/visit-expiration.service';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Create and start the application
const app = new App();
app.start().then(() => {
  // Start the visit expiration service
  const expirationService = VisitExpirationService.getInstance();
  expirationService.startExpirationCheck();
  
  logger.info('Visit expiration service started');
}).catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  const expirationService = VisitExpirationService.getInstance();
  expirationService.stopExpirationCheck();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  const expirationService = VisitExpirationService.getInstance();
  expirationService.stopExpirationCheck();
  process.exit(0);
});