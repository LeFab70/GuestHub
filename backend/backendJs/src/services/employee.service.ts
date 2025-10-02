import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateEmployeeRequest, UpdateEmployeeRequest, SearchQuery, PaginatedResponse } from '../types';
import { Employee } from '@prisma/client';

export class EmployeeService {
  // Créer un employé
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const newEmployee = await prisma.employee.create({
        data: {
          nom: employeeData.nom,
          prenom: employeeData.prenom,
          email: employeeData.email,
          telephone: employeeData.telephone || null,
          poste: employeeData.poste,
          departmentId: employeeData.departmentId,
          isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
        },
        include: {
          department: true
        }
      });
      logger.info('Employee created:', newEmployee);
      return newEmployee;
    } catch (error) {
      logger.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  // Obtenir un employé par ID
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          department: true
        }
      });
      return employee;
    } catch (error) {
      logger.error(`Error fetching employee with ID ${id}:`, error);
      throw new Error('Failed to fetch employee');
    }
  }

  // Obtenir tous les employés avec pagination
  async getAllEmployees(query: SearchQuery): Promise<PaginatedResponse<Employee>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = search ? {
        AND: [
          { isActive: true },
          {
            OR: [
              { nom: { contains: search, mode: 'insensitive' as const } },
              { prenom: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { telephone: { contains: search, mode: 'insensitive' as const } },
              { poste: { contains: search, mode: 'insensitive' as const } },
              { department: { nom: { contains: search, mode: 'insensitive' as const } } }
            ]
          }
        ]
      } : { isActive: true };

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            department: true
          }
        }),
        prisma.employee.count({ where })
      ]);

      return {
        data: employees,
        pagination: {
          page: page || 1,
          limit: limit || 10,
          total,
          totalPages: Math.ceil(total / (limit || 10))
        }
      };
    } catch (error) {
      logger.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  // Mettre à jour un employé
  async updateEmployee(id: string, updateData: UpdateEmployeeRequest): Promise<Employee | null> {
    try {
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          department: true
        }
      });
      logger.info('Employee updated:', updatedEmployee);
      return updatedEmployee;
    } catch (error) {
      logger.error(`Error updating employee with ID ${id}:`, error);
      throw new Error('Failed to update employee');
    }
  }

  // Supprimer un employé (soft delete)
  async deleteEmployee(id: string): Promise<boolean> {
    try {
      await prisma.employee.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
      logger.info(`Employee with ID ${id} deactivated`);
      return true;
    } catch (error) {
      logger.error(`Error deleting employee with ID ${id}:`, error);
      throw new Error('Failed to delete employee');
    }
  }

  // Rechercher des employés
  async searchEmployees(query: SearchQuery): Promise<PaginatedResponse<Employee>> {
    return this.getAllEmployees(query);
  }

  // Obtenir les employés par département
  async getEmployeesByDepartment(departmentId: string, query: SearchQuery): Promise<PaginatedResponse<Employee>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = {
        departmentId,
        isActive: true,
        ...(search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' as const } },
            { prenom: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { telephone: { contains: search, mode: 'insensitive' as const } },
            { poste: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {})
      };

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
          include: {
            department: true
          }
        }),
        prisma.employee.count({ where })
      ]);

      return {
        data: employees,
        pagination: {
          page: page || 1,
          limit: limit || 10,
          total,
          totalPages: Math.ceil(total / (limit || 10))
        }
      };
    } catch (error) {
      logger.error('Error fetching employees by department:', error);
      throw new Error('Failed to fetch employees by department');
    }
  }

  // Obtenir les statistiques des employés
  async getEmployeeStats(): Promise<any> {
    try {
      const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByDepartment,
        employeesByPoste
      ] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { isActive: true } }),
        prisma.employee.count({ where: { isActive: false } }),
        prisma.employee.groupBy({
          by: ['departmentId'],
          where: { isActive: true },
          _count: true,
          orderBy: { _count: { departmentId: 'desc' } }
        }),
        prisma.employee.groupBy({
          by: ['poste'],
          where: { isActive: true },
          _count: true,
          orderBy: { _count: { poste: 'desc' } }
        })
      ]);

      return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByDepartment,
        employeesByPoste
      };
    } catch (error) {
      logger.error('Error fetching employee statistics:', error);
      throw new Error('Failed to fetch employee statistics');
    }
  }
}

export const employeeService = new EmployeeService();
