import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/department.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateDepartmentRequest, UpdateDepartmentRequest, SearchQuery } from '../types';

export class DepartmentController {
  // Créer un département
  async createDepartment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const departmentData: CreateDepartmentRequest = req.body;
      
      const department = await departmentService.createDepartment(departmentData);
      
      const response: ApiResponse = {
        success: true,
        data: department,
        message: 'Department created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create department failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create department',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir un département par ID
  async getDepartmentById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const department = await departmentService.getDepartmentById(id);
      
      if (!department) {
        const response: ApiResponse = {
          success: false,
          message: 'Department not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: department,
        message: 'Department retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get department failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve department',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir tous les départements avec pagination
  async getAllDepartments(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await departmentService.getAllDepartments(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Departments retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all departments failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve departments',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour un département
  async updateDepartment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData: UpdateDepartmentRequest = req.body;
      
      const department = await departmentService.updateDepartment(id, updateData);
      
      if (!department) {
        const response: ApiResponse = {
          success: false,
          message: 'Department not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: department,
        message: 'Department updated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update department failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update department',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Supprimer un département
  async deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await departmentService.deleteDepartment(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Department not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Department deleted successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete department failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete department',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Rechercher des départements
  async searchDepartments(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await departmentService.searchDepartments(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Search completed successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Search departments failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les statistiques des départements
  async getDepartmentStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const stats = await departmentService.getDepartmentStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Department statistics retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get department stats failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve department statistics',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les départements avec le nombre d'employés
  async getDepartmentsWithEmployeeCount(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await departmentService.getDepartmentsWithEmployeeCount();
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Departments with employee count retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get departments with employee count failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve departments with employee count',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const departmentController = new DepartmentController();
