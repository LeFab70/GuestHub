import { prisma } from '../config/database';
import { authService } from './auth.service';
import { logger } from '../config/logger';

export class InitService {
  // Vérifier si l'application a été initialisée
  async isInitialized(): Promise<boolean> {
    try {
      const adminCount = await prisma.user.count({
        where: {
          role: 'ADMIN'
        }
      });
      
      return adminCount > 0;
    } catch (error) {
      logger.error('Error checking initialization status:', error);
      return false;
    }
  }

  // Initialiser l'application avec le premier admin
  async initializeApp(adminData: {
    login: string;
    email: string;
    password: string;
    nom: string;
    prenom: string;
  }): Promise<boolean> {
    try {
      // Vérifier si déjà initialisé
      if (await this.isInitialized()) {
        throw new Error('Application already initialized');
      }

      // Créer le premier admin
      const admin = await authService.createAdmin(adminData);
      
      if (admin) {
        logger.info('Application initialized successfully with first admin', {
          adminId: admin.id,
          email: admin.email
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  // Réinitialiser l'application (supprimer tous les utilisateurs)
  async resetApp(): Promise<boolean> {
    try {
      // Supprimer tous les utilisateurs
      await prisma.user.deleteMany({});
      
      logger.info('Application reset successfully - all users deleted');
      return true;
    } catch (error) {
      logger.error('Failed to reset application:', error);
      throw error;
    }
  }

  // Obtenir le statut d'initialisation
  async getInitStatus(): Promise<{
    initialized: boolean;
    adminCount: number;
    totalUsers: number;
  }> {
    try {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });
      
      const totalUsers = await prisma.user.count();
      
      return {
        initialized: adminCount > 0,
        adminCount,
        totalUsers
      };
    } catch (error) {
      logger.error('Error getting init status:', error);
      throw error;
    }
  }
}

export const initService = new InitService();
