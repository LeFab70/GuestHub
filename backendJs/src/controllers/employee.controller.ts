import { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import { logger } from '../config/logger';
import { ApiResponse, CreateEmployeeRequest, UpdateEmployeeRequest, SearchQuery } from '../types';

export class EmployeeController {
  // Créer un employé
  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const employeeData: CreateEmployeeRequest = req.body;
      
      const employee = await employeeService.createEmployee(employeeData);
      
      const response: ApiResponse = {
        success: true,
        data: employee,
        message: 'Employee created successfully',
        statusCode: 201
      };

      return res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir un employé par ID
  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const employee = await employeeService.getEmployeeById(id);
      
      if (!employee) {
        const response: ApiResponse = {
          success: false,
          message: 'Employee not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: employee,
        message: 'Employee retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir tous les employés avec pagination
  async getAllEmployees(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        status: (req.query.status as 'all' | 'active' | 'inactive') || 'all'
      };

      const result = await employeeService.getAllEmployees(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Employees retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get all employees failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve employees',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Mettre à jour un employé
  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData: UpdateEmployeeRequest = req.body;
      
      const employee = await employeeService.updateEmployee(id, updateData);
      
      if (!employee) {
        const response: ApiResponse = {
          success: false,
          message: 'Employee not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: employee,
        message: 'Employee updated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Désactiver un employé
  async deactivateEmployee(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await employeeService.deactivateEmployee(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Employee not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employee deactivated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Deactivate employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to deactivate employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Activer un employé
  async activateEmployee(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await employeeService.activateEmployee(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Employee not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employee activated successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Activate employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to activate employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Supprimer définitivement un employé
  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      const success = await employeeService.deleteEmployee(id);
      
      if (!success) {
        const response: ApiResponse = {
          success: false,
          message: 'Employee not found',
          statusCode: 404
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Employee deleted successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Delete employee failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete employee',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Rechercher des employés
  async searchEmployees(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await employeeService.searchEmployees(query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Search completed successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Search employees failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les employés par département
  async getEmployeesByDepartment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { departmentId } = req.params;
      const query: SearchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await employeeService.getEmployeesByDepartment(departmentId, query);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Employees by department retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get employees by department failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve employees by department',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }

  // Obtenir les statistiques des employés
  async getEmployeeStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const stats = await employeeService.getEmployeeStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Employee statistics retrieved successfully',
        statusCode: 200
      };
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get employee stats failed:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve employee statistics',
        statusCode: error.statusCode || 500
      };
      return res.status(response.statusCode).json(response);
    }
  }
}

export const employeeController = new EmployeeController();
