import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSyncService {
  private syncInterval = 30000; // 30 secondes pour éviter le rate limiting
  private isSyncing = false;
  private lastCheckTime = new Date(Date.now() - 5 * 60 * 1000); // Dernière vérification (5 min dans le passé au début)

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.startNotificationSync();
  }

  private startNotificationSync(): void {

    // Synchroniser les notifications toutes les 2 secondes
    interval(this.syncInterval).pipe(
      switchMap(() => this.checkForNewVisits()),
      startWith(0)
    ).subscribe({
      next: (newVisitsCount) => {
        if (newVisitsCount > 0 && !this.isSyncing) {
          this.isSyncing = true;
          this.syncNotifications(newVisitsCount);
        }
      },
      error: (error) => {
        this.isSyncing = false;
      }
    });
  }

  private checkForNewVisits(): Observable<number> {
    const since = this.lastCheckTime.toISOString();
    return this.apiService.getRecentVisitsWithTimestamp(since).pipe(
      switchMap(response => {
        const newVisits = response.data?.visits || [];
        const newVisitsCount = newVisits.length;
        
        return [newVisitsCount];
      })
    );
  }

  private syncNotifications(newVisitsCount: number): void {
    
    // Récupérer les détails de la dernière visite pour la notification
    const since = this.lastCheckTime.toISOString();
    this.apiService.getRecentVisitsWithTimestamp(since).subscribe({
      next: (response) => {
        if (response.success && response.data.visits.length > 0) {
          const latestVisit = response.data.visits[0];
          
          // Créer la notification synchronisée
          this.notificationService.addNotification({
            type: 'visit_created',
            title: 'Nouvelle visite confirmée',
            message: `${latestVisit.visiteur.prenom} ${latestVisit.visiteur.nom} vient visiter ${latestVisit.employe.prenom} ${latestVisit.employe.nom} (${latestVisit.employe.department.nom})`,
            count: newVisitsCount,
            actionUrl: '/badges',
            data: {
              badgeId: latestVisit.badge?.qrCode,
              visitorName: `${latestVisit.visiteur.prenom} ${latestVisit.visiteur.nom}`,
              employeeName: `${latestVisit.employe.prenom} ${latestVisit.employe.nom}`,
              departmentName: latestVisit.employe.department.nom
            }
          });
          
          // Mettre à jour le timestamp de la dernière vérification après avoir traité les notifications
          this.lastCheckTime = new Date();
        }
        this.isSyncing = false;
      },
      error: (error) => {
        this.isSyncing = false;
      }
    });
  }

  // Forcer la synchronisation immédiate
  forceSync(): void {
    if (!this.isSyncing) {
      this.checkForNewVisits().subscribe({
        next: (newVisitsCount) => {
          if (newVisitsCount > 0) {
            this.syncNotifications(newVisitsCount);
          }
        },
        error: (error) => {
          // Erreur lors de la synchronisation forcée
        }
      });
    }
  }
}
