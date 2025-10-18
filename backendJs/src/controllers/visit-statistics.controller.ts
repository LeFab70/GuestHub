import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export class VisitStatisticsController {
  // Obtenir les statistiques des visites
  public getVisitStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { dateFrom, dateTo, criteria } = req.query;

      if (!dateFrom || !dateTo || !criteria) {
        res.status(400).json({
          success: false,
          message: 'Les paramètres dateFrom, dateTo et criteria sont requis'
        });
        return;
      }

      const startDate = new Date(dateFrom as string);
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999); // Fin de journée

      logger.info('Generating visit statistics', {
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        criteria
      });

      // Récupérer toutes les visites dans la période, puis filtrer côté application
      const allVisits = await prisma.visite.findMany({
        where: {
          dateDebut: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          visiteur: true,
          employe: {
            include: {
              department: true
            }
          },
          badge: true
        }
      });

      // Filtrer uniquement les visites terminées ou expirées (badges fermés)
      const visits = allVisits.filter(visit => 
        (visit.statut === 'TERMINEE' || visit.statut === 'EXPIREE') && 
        visit.badge?.status === 'CLOSED'
      );

      logger.info(`Found ${visits.length} completed/expired visits (closed badges) in the specified period`);

      // Calculer les statistiques selon le critère
      let statistics: any = {
        totalVisits: visits.length,
        visitsByDepartment: [],
        visitsByEmployee: [],
        visitsByStatus: [],
        visitsByDate: []
      };

      // Toujours calculer toutes les statistiques pour avoir des données complètes
      statistics.visitsByDepartment = this.calculateByDepartment(visits);
      statistics.visitsByEmployee = this.calculateByEmployee(visits);
      statistics.visitsByStatus = this.calculateByStatus(visits);
      statistics.visitsByDate = this.calculateByDate(visits);

      res.json({
        success: true,
        data: statistics,
        message: 'Statistiques générées avec succès'
      });

    } catch (error) {
      logger.error('Error generating visit statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération des statistiques'
      });
    }
  };

  private calculateByDepartment(visits: any[]): Array<{ departmentName: string; count: number }> {
    const departmentMap = new Map<string, number>();

    visits.forEach(visit => {
      const departmentName = visit.employe?.department?.nom || 'Non assigné';
      departmentMap.set(departmentName, (departmentMap.get(departmentName) || 0) + 1);
    });

    return Array.from(departmentMap.entries())
      .map(([departmentName, count]) => ({ departmentName, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateByEmployee(visits: any[]): Array<{ employeeName: string; departmentName: string; count: number }> {
    const employeeMap = new Map<string, { departmentName: string; count: number }>();

    visits.forEach(visit => {
      if (visit.employe) {
        const employeeName = `${visit.employe.prenom} ${visit.employe.nom}`;
        const departmentName = visit.employe.department?.nom || 'Non assigné';
        
        if (employeeMap.has(employeeName)) {
          employeeMap.get(employeeName)!.count++;
        } else {
          employeeMap.set(employeeName, { departmentName, count: 1 });
        }
      }
    });

    return Array.from(employeeMap.entries())
      .map(([employeeName, data]) => ({ employeeName, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateByStatus(visits: any[]): Array<{ status: string; count: number }> {
    const statusMap = new Map<string, number>();

    visits.forEach(visit => {
      statusMap.set(visit.statut, (statusMap.get(visit.statut) || 0) + 1);
    });

    return Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateByDate(visits: any[]): Array<{ date: string; count: number }> {
    const dateMap = new Map<string, number>();

    visits.forEach(visit => {
      const date = new Date(visit.dateDebut).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
