import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { logger } from '../config/logger';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn('Validation failed', {
      errors: errorMessages,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errorMessages
    });
    return;
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  id: param('id').isUUID().withMessage('ID must be a valid UUID'),
  page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  search: query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  email: body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  password: body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  phone: body('telephone').optional().isMobilePhone('any').withMessage('Must be a valid phone number'),
  date: body('dateDebut').isISO8601().withMessage('Must be a valid date in ISO 8601 format'),
  futureDate: body('dateDebut').isISO8601().withMessage('Must be a valid date in ISO 8601 format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Date must be in the future');
      }
      return true;
    })
};

// User validations
export const userValidations = {
  create: [
    body('login').isLength({ min: 3, max: 50 }).withMessage('Login must be between 3 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
    body('nom').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('role').isIn(['ADMIN', 'RECEPTIONNISTE', 'USER']).withMessage('Role must be ADMIN, RECEPTIONNISTE, or USER'),
    handleValidationErrors
  ],
  
  update: [
    body('login').optional().isLength({ min: 3, max: 50 }).withMessage('Login must be between 3 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('nom').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('role').optional().isIn(['ADMIN', 'RECEPTIONNISTE', 'USER']).withMessage('Role must be ADMIN, RECEPTIONNISTE, or USER'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
    query('role').optional().isIn(['ADMIN', 'RECEPTIONNISTE', 'USER']).withMessage('Invalid role filter'),
    query('isActive').optional().isBoolean().withMessage('isActive filter must be a boolean'),
    handleValidationErrors
  ]
};

// Department validations
export const departmentValidations = {
  create: [
    body('nom').isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    handleValidationErrors
  ],
  
  update: [
    body('nom').optional().isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    query('isActive').optional().isBoolean().withMessage('isActive filter must be a boolean'),
    handleValidationErrors
  ]
};

// Employee validations
export const employeeValidations = {
  create: [
    body('nom').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('telephone').optional().isMobilePhone('any').withMessage('Must be a valid phone number'),
    body('poste').optional().isLength({ max: 100 }).withMessage('Position must not exceed 100 characters'),
    body('departmentId').isUUID().withMessage('Department ID must be a valid UUID'),
    handleValidationErrors
  ],
  
  update: [
    body('nom').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('telephone').optional().isMobilePhone('any').withMessage('Must be a valid phone number'),
    body('poste').optional().isLength({ max: 100 }).withMessage('Position must not exceed 100 characters'),
    body('departmentId').optional().isUUID().withMessage('Department ID must be a valid UUID'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    query('departmentId').optional().isUUID().withMessage('Department ID must be a valid UUID'),
    query('isActive').optional().isBoolean().withMessage('isActive filter must be a boolean'),
    handleValidationErrors
  ]
};

// Visitor validations
export const visitorValidations = {
  create: [
    body('nom').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('telephone').optional().isMobilePhone('any').withMessage('Must be a valid phone number'),
    body('entreprise').optional().isLength({ max: 100 }).withMessage('Company name must not exceed 100 characters'),
    handleValidationErrors
  ],
  
  update: [
    body('nom').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('prenom').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('telephone').optional().isMobilePhone('any').withMessage('Must be a valid phone number'),
    body('entreprise').optional().isLength({ max: 100 }).withMessage('Company name must not exceed 100 characters'),
    body('estBlackliste').optional().isBoolean().withMessage('estBlackliste must be a boolean'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    query('estBlackliste').optional().isBoolean().withMessage('estBlackliste filter must be a boolean'),
    handleValidationErrors
  ]
};

// Visit validations
export const visitValidations = {
  create: [
    body('dateDebut').isISO8601().withMessage('Start date must be a valid date in ISO 8601 format'),
    body('dateFin').optional().isISO8601().withMessage('End date must be a valid date in ISO 8601 format'),
    body('motif').isLength({ min: 5, max: 500 }).withMessage('Purpose must be between 5 and 500 characters'),
    body('visiteurId').isUUID().withMessage('Visitor ID must be a valid UUID'),
    body('employeId').isUUID().withMessage('Employee ID must be a valid UUID'),
    handleValidationErrors
  ],
  
  update: [
    body('dateDebut').optional().isISO8601().withMessage('Start date must be a valid date in ISO 8601 format'),
    body('dateFin').optional().isISO8601().withMessage('End date must be a valid date in ISO 8601 format'),
    body('motif').optional().isLength({ min: 5, max: 500 }).withMessage('Purpose must be between 5 and 500 characters'),
    body('statut').optional().isIn(['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']).withMessage('Invalid status'),
    body('visiteurId').optional().isUUID().withMessage('Visitor ID must be a valid UUID'),
    body('employeId').optional().isUUID().withMessage('Employee ID must be a valid UUID'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    query('statut').optional().isIn(['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']).withMessage('Invalid status filter'),
    query('visiteurId').optional().isUUID().withMessage('Visitor ID must be a valid UUID'),
    query('employeId').optional().isUUID().withMessage('Employee ID must be a valid UUID'),
    query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
    query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
    handleValidationErrors
  ]
};

// Badge validations
export const badgeValidations = {
  create: [
    body('visiteId').isUUID().withMessage('Visit ID must be a valid UUID'),
    handleValidationErrors
  ],
  
  update: [
    body('etat').isIn(['GENERE', 'EN_ATTENTE_VALIDATION', 'IMPRIME', 'VALIDE', 'RENDU', 'SCANNE', 'AUTO_EXPIRE']).withMessage('Invalid badge state'),
    handleValidationErrors
  ],
  
  getById: [commonValidations.id, handleValidationErrors],
  
  list: [
    commonValidations.page,
    commonValidations.limit,
    query('etat').optional().isIn(['GENERE', 'EN_ATTENTE_VALIDATION', 'IMPRIME', 'VALIDE', 'RENDU', 'SCANNE', 'AUTO_EXPIRE']).withMessage('Invalid state filter'),
    query('visiteId').optional().isUUID().withMessage('Visit ID must be a valid UUID'),
    handleValidationErrors
  ]
};

// Authentication validations
export const authValidations = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
    body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean'),
    handleValidationErrors
  ],
  
  refreshToken: [
    body('refreshToken').isLength({ min: 1 }).withMessage('Refresh token is required'),
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword').isLength({ min: 8, max: 128 }).withMessage('Current password must be between 8 and 128 characters'),
    body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters'),
    body('confirmPassword').isLength({ min: 8, max: 128 }).withMessage('Confirm password must be between 8 and 128 characters'),
    handleValidationErrors
  ]
};

// File upload validations
export const fileUploadValidations = {
  image: [
    body('file').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw new Error('File size must not exceed 5MB');
      }
      
      return true;
    }),
    handleValidationErrors
  ]
};

// Custom validation helpers
export const validateDateRange = (startDateField: string, endDateField: string) => {
  return body(endDateField).custom((value, { req }) => {
    if (value && req.body[startDateField]) {
      const startDate = new Date(req.body[startDateField]);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }
    return true;
  });
};

export const validateUniqueEmail = (model: any, excludeId?: string) => {
  return body('email').custom(async (value) => {
    if (!value) return true;
    
    const where: any = { email: value };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    
    const existing = await model.findFirst({ where });
    if (existing) {
      throw new Error('Email already exists');
    }
    return true;
  });
};

export const validateUniqueLogin = (model: any, excludeId?: string) => {
  return body('login').custom(async (value) => {
    if (!value) return true;
    
    const where: any = { login: value };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    
    const existing = await model.findFirst({ where });
    if (existing) {
      throw new Error('Login already exists');
    }
    return true;
  });
};

