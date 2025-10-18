import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;

  // Database
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;

  // Redis
  REDIS_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Keycloak
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  KEYCLOAK_SERVER_URL: string;
  KEYCLOAK_AUTH_SERVER_URL: string;

  // CORS
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  DISABLE_RATE_LIMIT: boolean;

  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;

  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;

  // Security
  BCRYPT_ROUNDS: number;
  SESSION_SECRET: string;

  // API Documentation
  API_DOCS_PATH: string;
  SWAGGER_TITLE: string;
  SWAGGER_VERSION: string;
  SWAGGER_DESCRIPTION: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'KEYCLOAK_CLIENT_SECRET'
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

const config: Config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'guesthub_db',
  DB_USER: process.env.DB_USER || 'username',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Keycloak
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'guesthub',
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'guesthub-backend',
  KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET || '',
  KEYCLOAK_SERVER_URL: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  KEYCLOAK_AUTH_SERVER_URL: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080/auth',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  DISABLE_RATE_LIMIT: process.env.DISABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'development',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@guesthub.com',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  SESSION_SECRET: process.env.SESSION_SECRET!,

  // API Documentation
  API_DOCS_PATH: process.env.API_DOCS_PATH || '/api-docs',
  SWAGGER_TITLE: process.env.SWAGGER_TITLE || 'GuestHub API',
  SWAGGER_VERSION: process.env.SWAGGER_VERSION || '1.0.0',
  SWAGGER_DESCRIPTION: process.env.SWAGGER_DESCRIPTION || 'API for Visitor Management System'
};

// Validate configuration
const validateConfig = () => {
  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  if (config.DB_PORT < 1 || config.DB_PORT > 65535) {
    throw new Error('DB_PORT must be between 1 and 65535');
  }

  if (config.REDIS_PORT < 1 || config.REDIS_PORT > 65535) {
    throw new Error('REDIS_PORT must be between 1 and 65535');
  }

  if (config.SMTP_PORT < 1 || config.SMTP_PORT > 65535) {
    throw new Error('SMTP_PORT must be between 1 and 65535');
  }

  if (config.BCRYPT_ROUNDS < 10 || config.BCRYPT_ROUNDS > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
  }

  if (config.MAX_FILE_SIZE < 1024 || config.MAX_FILE_SIZE > 50 * 1024 * 1024) {
    throw new Error('MAX_FILE_SIZE must be between 1KB and 50MB');
  }
};

try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

export default config;
