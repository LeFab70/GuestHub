import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateDepartmentRequest, UpdateDepartmentRequest, SearchQuery, PaginatedResponse } from '../types';
import { Department } from '@prisma/client';

export class DepartmentService {
  // Créer un département
  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    try {
      // Vérifier si un département avec ce nom existe déjà (actif)
      const existingDepartment = await prisma.department.findFirst({
        where: {
          nom: departmentData.nom,
          isActive: true
        }
      });

      if (existingDepartment) {
        // Suggérer un nom alternatif
        const suggestedName = await this.generateUniqueName(departmentData.nom);
        throw new Error(`Un département avec le nom "${departmentData.nom}" existe déjà. Nom suggéré: "${suggestedName}"`);
      }

      const newDepartment = await prisma.department.create({
        data: {
          nom: departmentData.nom,
          description: departmentData.description || null,
          isActive: departmentData.isActive !== undefined ? departmentData.isActive : true,
        }
      });
      logger.info('Department created:', newDepartment);
      return newDepartment;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw error; // Re-throw pour préserver le message d'erreur personnalisé
    }
  }

  // Générer un nom unique pour un département
  private async generateUniqueName(baseName: string): Promise<string> {
    let counter = 1;
    let suggestedName = `${baseName} (${counter})`;
    
    while (true) {
      const exists = await prisma.department.findFirst({
        where: {
          nom: suggestedName,
          isActive: true
        }
      });
      
      if (!exists) {
        return suggestedName;
      }
      
      counter++;
      suggestedName = `${baseName} (${counter})`;
    }
  }

  // Créer un département avec suggestion automatique en cas de doublon
  async createDepartmentWithSuggestion(departmentData: CreateDepartmentRequest): Promise<Department> {
    try {
      // Vérifier si un département avec ce nom existe déjà (actif)
      const existingDepartment = await prisma.department.findFirst({
        where: {
          nom: departmentData.nom,
          isActive: true
        }
      });

      let finalName = departmentData.nom;
      
      if (existingDepartment) {
        // Générer automatiquement un nom unique
        finalName = await this.generateUniqueName(departmentData.nom);
        logger.info(`Department name conflict resolved. Using: ${finalName}`);
      }

      const newDepartment = await prisma.department.create({
        data: {
          nom: finalName,
          description: departmentData.description || null,
          isActive: departmentData.isActive !== undefined ? departmentData.isActive : true,
        }
      });
      
      logger.info('Department created with suggestion:', newDepartment);
      return newDepartment;
    } catch (error) {
      logger.error('Error creating department with suggestion:', error);
      throw new Error('Failed to create department');
    }
  }

  // Obtenir un département par ID
  async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const department = await prisma.department.findUnique({
        where: { id }
      });
      return department;
    } catch (error) {
      logger.error(`Error fetching department with ID ${id}:`, error);
      throw new Error('Failed to fetch department');
    }
  }

  // Obtenir tous les départements avec pagination
  async getAllDepartments(query: SearchQuery): Promise<PaginatedResponse<Department>> {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      const where = search ? {
        AND: [
          { isActive: true },
          {
            OR: [
              { nom: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        ]
      } : { isActive: true };

      const [departments, total] = await Promise.all([
        prisma.department.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.department.count({ where })
      ]);

      return {
        data: departments,
        pagination: {
          page: page || 1,
          limit: limit || 10,
          total,
          totalPages: Math.ceil(total / (limit || 10))
        }
      };
    } catch (error) {
      logger.error('Error fetching departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  // Mettre à jour un département
  async updateDepartment(id: string, updateData: UpdateDepartmentRequest): Promise<Department | null> {
    try {
      const updatedDepartment = await prisma.department.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
      logger.info('Department updated:', updatedDepartment);
      return updatedDepartment;
    } catch (error) {
      logger.error(`Error updating department with ID ${id}:`, error);
      throw new Error('Failed to update department');
    }
  }

  // Supprimer un département (soft delete)
  async deleteDepartment(id: string): Promise<boolean> {
    try {
      await prisma.department.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
      logger.info(`Department with ID ${id} deactivated`);
      return true;
    } catch (error) {
      logger.error(`Error deleting department with ID ${id}:`, error);
      throw new Error('Failed to delete department');
    }
  }

  // Rechercher des départements
  async searchDepartments(query: SearchQuery): Promise<PaginatedResponse<Department>> {
    return this.getAllDepartments(query);
  }

  // Obtenir les statistiques des départements
  async getDepartmentStats(): Promise<any> {
    try {
      const [
        totalDepartments,
        activeDepartments,
        inactiveDepartments,
        departmentsWithEmployees
      ] = await Promise.all([
        prisma.department.count(),
        prisma.department.count({ where: { isActive: true } }),
        prisma.department.count({ where: { isActive: false } }),
        prisma.department.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: { employees: true }
            }
          }
        })
      ]);

      return {
        totalDepartments,
        activeDepartments,
        inactiveDepartments,
        departmentsWithEmployees
      };
    } catch (error) {
      logger.error('Error fetching department statistics:', error);
      throw new Error('Failed to fetch department statistics');
    }
  }

  // Obtenir les départements avec le nombre d'employés
  async getDepartmentsWithEmployeeCount(): Promise<any[]> {
    try {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { 
              employees: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { nom: 'asc' }
      });

      return departments.map(dept => ({
        id: dept.id,
        nom: dept.nom,
        description: dept.description,
        employeeCount: dept._count.employees,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt
      }));
    } catch (error) {
      logger.error('Error fetching departments with employee count:', error);
      throw new Error('Failed to fetch departments with employee count');
    }
  }
}

export const departmentService = new DepartmentService();
