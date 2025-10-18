import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export class VisitExpirationService {
  private static instance: VisitExpirationService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Vérifier toutes les 5 minutes

  private constructor() {}

  public static getInstance(): VisitExpirationService {
    if (!VisitExpirationService.instance) {
      VisitExpirationService.instance = new VisitExpirationService();
    }
    return VisitExpirationService.instance;
  }

  public startExpirationCheck(): void {
    // Vérifier immédiatement au démarrage
    this.checkAndExpireVisits();
    
    // Puis vérifier périodiquement
    this.intervalId = setInterval(() => {
      this.checkAndExpireVisits();
    }, this.CHECK_INTERVAL);

    logger.info('Visit expiration service started');
  }

  public stopExpirationCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Visit expiration service stopped');
    }
  }

  private async checkAndExpireVisits(): Promise<void> {
    try {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Début de la journée
      
      logger.info(`Checking for expired visits at ${now.toISOString()}`);
      
      // Trouver toutes les visites EN_COURS
      const activeVisits = await prisma.visite.findMany({
        where: {
          statut: 'EN_COURS'
        },
        include: {
          badge: true,
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          }
        }
      });

      logger.info(`Found ${activeVisits.length} active visits to check`);

      const expiredVisits = [];
      
      for (const visit of activeVisits) {
        let shouldExpire = false;
        const visitStartDate = new Date(visit.dateDebut);
        
        // NOUVELLE LOGIQUE: Si la date de début est antérieure à la date actuelle (jour différent)
        const visitStartDay = new Date(visitStartDate);
        visitStartDay.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        if (visitStartDay < today) {
          shouldExpire = true;
          logger.info(`Visit ${visit.id} expired: start date ${visitStartDate.toISOString()} is before today ${today.toISOString()}`);
        }
        // Si la visite a une dateFin définie et qu'elle est dans le passé
        else if (visit.dateFin) {
          const visitEndDate = new Date(visit.dateFin);
          if (visitEndDate < now) {
            shouldExpire = true;
            logger.info(`Visit ${visit.id} expired: dateFin ${visitEndDate.toISOString()} < now ${now.toISOString()}`);
          }
        } else {
          // Si pas de dateFin, vérifier si la visite a commencé il y a plus de 8 heures (durée par défaut)
          const eightHoursAgo = new Date(now.getTime() - (8 * 60 * 60 * 1000));
          
          if (visitStartDate < eightHoursAgo) {
            shouldExpire = true;
            logger.info(`Visit ${visit.id} expired: started ${visitStartDate.toISOString()}, more than 8 hours ago`);
          }
        }
        
        if (shouldExpire) {
          expiredVisits.push(visit);
        }
      }

      if (expiredVisits.length > 0) {
        logger.info(`Found ${expiredVisits.length} expired visits to process`);

        for (const visit of expiredVisits) {
          await this.expireVisit(visit);
        }
        
        // Envoyer une notification globale
        logger.info(`Successfully expired ${expiredVisits.length} visits`);
      } else {
        logger.info('No expired visits found');
      }
    } catch (error) {
      logger.error('Error checking expired visits:', error);
    }
  }

  private async expireVisit(visit: any): Promise<void> {
    try {
      const now = new Date();
      
      await prisma.$transaction(async (tx) => {
        // Mettre à jour la visite à EXPIREE avec la date de fin actuelle
        await tx.visite.update({
          where: { id: visit.id },
          data: {
            statut: 'EXPIREE',
            dateFin: now, // S'assurer que la date de fin est définie
            updatedAt: now
          }
        });

        // Mettre à jour le badge associé à CLOSED
        if (visit.badge) {
          await tx.badge.update({
            where: { id: visit.badge.id },
            data: {
              status: 'CLOSED',
              updatedAt: now
            }
          });
        }

        logger.info(`Visit ${visit.id} expired automatically`, {
          visitId: visit.id,
          visitorName: visit.visiteur ? `${visit.visiteur.prenom} ${visit.visiteur.nom}` : 'Unknown',
          employeeName: visit.employe ? `${visit.employe.prenom} ${visit.employe.nom}` : 'Unknown',
          departmentName: visit.employe?.department?.nom || 'Unknown',
          originalDateFin: visit.dateFin,
          newDateFin: now.toISOString(),
          badgeId: visit.badge?.id
        });
      });
    } catch (error) {
      logger.error(`Error expiring visit ${visit.id}:`, error);
    }
  }

  // Méthode pour déclencher manuellement la vérification d'expiration
  public async triggerManualCheck(): Promise<{ expiredCount: number; message: string }> {
    try {
      logger.info('Manual expiration check triggered');
      
      const now = new Date();
      const activeVisits = await prisma.visite.findMany({
        where: { statut: 'EN_COURS' },
        include: { badge: true, visiteur: true, employe: { include: { department: true } } }
      });

      let expiredCount = 0;
      const expiredVisits = [];

      for (const visit of activeVisits) {
        let shouldExpire = false;
        const visitStartDate = new Date(visit.dateDebut);
        
        // NOUVELLE LOGIQUE: Si la date de début est antérieure à la date actuelle (jour différent)
        const visitStartDay = new Date(visitStartDate);
        visitStartDay.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        if (visitStartDay < today) {
          shouldExpire = true;
        }
        // Si la visite a une dateFin définie et qu'elle est dans le passé
        else if (visit.dateFin) {
          const visitEndDate = new Date(visit.dateFin);
          if (visitEndDate < now) {
            shouldExpire = true;
          }
        } else {
          // Si pas de dateFin, vérifier si la visite a commencé il y a plus de 8 heures (durée par défaut)
          const eightHoursAgo = new Date(now.getTime() - (8 * 60 * 60 * 1000));
          if (visitStartDate < eightHoursAgo) {
            shouldExpire = true;
          }
        }
        
        if (shouldExpire) {
          expiredVisits.push(visit);
        }
      }

      for (const visit of expiredVisits) {
        await this.expireVisit(visit);
        expiredCount++;
      }

      const message = expiredCount > 0 
        ? `${expiredCount} visite(s) expirée(s) automatiquement`
        : 'Aucune visite à expirer';

      return { expiredCount, message };
    } catch (error) {
      logger.error('Error in manual expiration check:', error);
      throw error;
    }
  }

  // Méthode pour compter les visites à expirer sans les expirer
  public async countVisitsToExpire(): Promise<{ count: number; visits: any[] }> {
    try {
      const now = new Date();
      const activeVisits = await prisma.visite.findMany({
        where: { statut: 'EN_COURS' },
        include: { 
          badge: true, 
          visiteur: true, 
          employe: { 
            include: { 
              department: true 
            } 
          } 
        }
      });

      const visitsToExpire = [];

      for (const visit of activeVisits) {
        let shouldExpire = false;
        const visitStartDate = new Date(visit.dateDebut);
        
        // Si la date de début est antérieure à la date actuelle (jour différent)
        const visitStartDay = new Date(visitStartDate);
        visitStartDay.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        if (visitStartDay < today) {
          shouldExpire = true;
        }
        // Si la visite a une dateFin définie et qu'elle est dans le passé
        else if (visit.dateFin) {
          const visitEndDate = new Date(visit.dateFin);
          if (visitEndDate < now) {
            shouldExpire = true;
          }
        } else {
          // Si pas de dateFin, vérifier si la visite a commencé il y a plus de 8 heures (durée par défaut)
          const eightHoursAgo = new Date(now.getTime() - (8 * 60 * 60 * 1000));
          if (visitStartDate < eightHoursAgo) {
            shouldExpire = true;
          }
        }
        
        if (shouldExpire) {
          visitsToExpire.push({
            id: visit.id,
            visitorName: visit.visiteur ? `${visit.visiteur.prenom} ${visit.visiteur.nom}` : 'Unknown',
            employeeName: visit.employe ? `${visit.employe.prenom} ${visit.employe.nom}` : 'Unknown',
            departmentName: visit.employe?.department?.nom || 'Unknown',
            startDate: visit.dateDebut,
            endDate: visit.dateFin,
            badgeId: visit.badge?.id
          });
        }
      }

      return { 
        count: visitsToExpire.length, 
        visits: visitsToExpire 
      };
    } catch (error) {
      logger.error('Error counting visits to expire:', error);
      throw error;
    }
  }

  // Méthode pour expirer manuellement une visite (utile pour les tests)
  public async expireVisitById(visitId: string): Promise<boolean> {
    try {
      const visit = await prisma.visite.findUnique({
        where: { id: visitId },
        include: { badge: true }
      });

      if (!visit) {
        logger.warn(`Visit ${visitId} not found`);
        return false;
      }

      if (visit.statut !== 'EN_COURS') {
        logger.warn(`Visit ${visitId} is not in EN_COURS status`);
        return false;
      }

      await this.expireVisit(visit);
      return true;
    } catch (error) {
      logger.error(`Error manually expiring visit ${visitId}:`, error);
      return false;
    }
  }
}
