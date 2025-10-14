import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GuestHub API',
      version: '1.0.0',
      description: 'API pour la gestion des visiteurs et des visites',
      contact: {
        name: 'Fabrice Corporation',
        email: 'support@fabricecorp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            login: { type: 'string' },
            email: { type: 'string', format: 'email' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Visitor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            telephone: { type: 'string', nullable: true },
            entreprise: { type: 'string', nullable: true },
            estBlackliste: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Visite: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            dateDebut: { type: 'string', format: 'date-time' },
            dateFin: { type: 'string', format: 'date-time', nullable: true },
            motif: { type: 'string' },
            statut: { type: 'string', enum: ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'] },
            visiteurId: { type: 'string', format: 'uuid' },
            employeId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            qrCode: { type: 'string' },
            etat: { type: 'string', enum: ['GENERE', 'EN_ATTENTE_VALIDATION', 'IMPRIME', 'VALIDE', 'RENDU', 'SCANNE', 'AUTO_EXPIRE'] },
            visiteId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telephone: { type: 'string', nullable: true },
            poste: { type: 'string' },
            departmentId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            action: { type: 'string', enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS'] },
            entityType: { type: 'string' },
            entityId: { type: 'string', nullable: true },
            details: { type: 'string', nullable: true },
            dateHeure: { type: 'string', format: 'date-time' },
            userId: { type: 'string', format: 'uuid', nullable: true },
            user: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' },
                login: { type: 'string' },
                email: { type: 'string' },
                nom: { type: 'string' },
                prenom: { type: 'string' }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1 },
            total: { type: 'integer', minimum: 0 },
            totalPages: { type: 'integer', minimum: 0 }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'object' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Error details' },
            statusCode: { type: 'integer', example: 400 }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            },
            statusCode: { type: 'integer', example: 400 }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification'
      },
      {
        name: 'Visitors',
        description: 'Gestion des visiteurs'
      },
      {
        name: 'Visits',
        description: 'Gestion des visites'
      },
      {
        name: 'Badges',
        description: 'Gestion des badges'
      },
      {
        name: 'Employees',
        description: 'Gestion des employés'
      },
      {
        name: 'Departments',
        description: 'Gestion des départements'
      },
      {
        name: 'Audit',
        description: 'Gestion des logs d\'audit'
      },
      {
        name: 'System',
        description: 'Endpoints système'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'GuestHub API Documentation'
  }));
};

export default specs;
