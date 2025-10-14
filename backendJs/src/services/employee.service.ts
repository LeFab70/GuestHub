import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CreateEmployeeRequest, UpdateEmployeeRequest, SearchQuery, PaginatedResponse } from '../types';
import { Employee } from '@prisma/client';

export class EmployeeService {
  // Créer un employé
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      // Vérifier si un employé avec cet email existe déjà (tous statuts)
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: employeeData.email
        }
      });

      if (existingEmployee) {
        // Suggérer un email alternatif
        const suggestedEmail = await this.generateUniqueEmail(employeeData.email);
        throw new Error(`Un employé avec l'email "${employeeData.email}" existe déjà. Email suggéré: "${suggestedEmail}"`);
      }

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
      throw error; // Re-throw pour préserver le message d'erreur personnalisé
    }
  }

  // Générer un email unique pour un employé
  private async generateUniqueEmail(baseEmail: string): Promise<string> {
    const [localPart, domain] = baseEmail.split('@');
    let counter = 1;
    let suggestedEmail = `${localPart}+${counter}@${domain}`;
    
    while (true) {
      const exists = await prisma.employee.findFirst({
        where: {
          email: suggestedEmail,
          isActive: true
        }
      });
      
      if (!exists) {
        return suggestedEmail;
      }
      
      counter++;
      suggestedEmail = `${localPart}+${counter}@${domain}`;
    }
  }

  // Créer un employé avec suggestion automatique en cas de doublon
  async createEmployeeWithSuggestion(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      // Vérifier si un employé avec cet email existe déjà (actif)
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: employeeData.email,
          isActive: true
        }
      });

      let finalEmail = employeeData.email;
      
      if (existingEmployee) {
        // Générer automatiquement un email unique
        finalEmail = await this.generateUniqueEmail(employeeData.email);
        logger.info(`Employee email conflict resolved. Using: ${finalEmail}`);
      }

      const newEmployee = await prisma.employee.create({
        data: {
          nom: employeeData.nom,
          prenom: employeeData.prenom,
          email: finalEmail,
          telephone: employeeData.telephone || null,
          poste: employeeData.poste,
          departmentId: employeeData.departmentId,
          isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
        },
        include: {
          department: true
        }
      });
      
      logger.info('Employee created with suggestion:', newEmployee);
      return newEmployee;
    } catch (error) {
      logger.error('Error creating employee with suggestion:', error);
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
      const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', status } = query;
      const skip = (page - 1) * limit;

      // Construire les conditions de filtrage
      const conditions: any[] = [];
      
      // Filtre par statut (actif/inactif/tous)
      if (status === 'active') {
        conditions.push({ isActive: true });
      } else if (status === 'inactive') {
        conditions.push({ isActive: false });
      }
      // Si status n'est pas spécifié ou est 'all', on inclut tous les employés

      // Filtre par recherche
      if (search) {
        conditions.push({
          OR: [
            { nom: { contains: search, mode: 'insensitive' as const } },
            { prenom: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { telephone: { contains: search, mode: 'insensitive' as const } },
            { poste: { contains: search, mode: 'insensitive' as const } },
            { department: { nom: { contains: search, mode: 'insensitive' as const } } }
          ]
        });
      }

      const where = conditions.length > 0 ? { AND: conditions } : {};

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
      // Filtrer les données pour ne garder que les champs valides
      const { nom, prenom, email, telephone, poste, departmentId, isActive } = updateData;
      
      const dataToUpdate: any = {
        updatedAt: new Date()
      };
      
      if (nom !== undefined) dataToUpdate.nom = nom;
      if (prenom !== undefined) dataToUpdate.prenom = prenom;
      if (email !== undefined) dataToUpdate.email = email;
      if (telephone !== undefined) dataToUpdate.telephone = telephone;
      if (poste !== undefined) dataToUpdate.poste = poste;
      if (departmentId !== undefined) dataToUpdate.departmentId = departmentId;
      if (isActive !== undefined) dataToUpdate.isActive = isActive;

      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: dataToUpdate,
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

  // Désactiver un employé (soft delete)
  async deactivateEmployee(id: string): Promise<boolean> {
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
      logger.error(`Error deactivating employee with ID ${id}:`, error);
      throw new Error('Failed to deactivate employee');
    }
  }

  // Activer un employé
  async activateEmployee(id: string): Promise<boolean> {
    try {
      await prisma.employee.update({
        where: { id },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });
      logger.info(`Employee with ID ${id} activated`);
      return true;
    } catch (error) {
      logger.error(`Error activating employee with ID ${id}:`, error);
      throw new Error('Failed to activate employee');
    }
  }

  // Supprimer définitivement un employé
  async deleteEmployee(id: string): Promise<boolean> {
    try {
      await prisma.employee.delete({
        where: { id }
      });
      logger.info(`Employee with ID ${id} permanently deleted`);
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
