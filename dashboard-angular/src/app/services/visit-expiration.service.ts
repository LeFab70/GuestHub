import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitExpirationService {
  private apiService = inject(ApiService);
  private expirationCheckInterval = 5 * 60 * 1000; // Vérifier toutes les 5 minutes
  private subscription: Subscription | null = null;
  
  private expiredVisitsSubject = new BehaviorSubject<number>(0);
  public expiredVisits$ = this.expiredVisitsSubject.asObservable();

  constructor() {
    this.startExpirationCheck();
  }

  private startExpirationCheck(): void {
    // Vérifier immédiatement au démarrage
    this.checkAndExpireVisits();
    
    // Puis vérifier périodiquement
    this.subscription = interval(this.expirationCheckInterval).subscribe(() => {
      this.checkAndExpireVisits();
    });
  }

  private checkAndExpireVisits(): void {
    // Utiliser l'endpoint backend pour déclencher la vérification
    this.apiService.triggerExpirationCheck().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const { expiredCount, message } = response.data;
          if (expiredCount > 0) {
            this.expiredVisitsSubject.next(expiredCount);
          }
        }
      },
      error: (error) => {
        // Fallback: vérification côté frontend si l'endpoint backend échoue
        this.checkVisitsFrontend();
      }
    });
  }

  private checkVisitsFrontend(): void {
    this.apiService.getVisites().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          const visits = response.data.data;
          const now = new Date();
          let expiredCount = 0;

          visits.forEach((visit: any) => {
            if (visit.statut === 'EN_COURS') {
              let shouldExpire = false;
              
              if (visit.dateFin) {
                const endTime = new Date(visit.dateFin);
                if (now > endTime) {
                  shouldExpire = true;
                }
              } else {
                // Si pas de dateFin, vérifier si la visite a commencé il y a plus de 8 heures
                const startTime = new Date(visit.dateDebut);
                const eightHoursAgo = new Date(now.getTime() - (8 * 60 * 60 * 1000));
                if (startTime < eightHoursAgo) {
                  shouldExpire = true;
                }
              }
              
              if (shouldExpire) {
                this.expireVisit(visit.id);
                expiredCount++;
              }
            }
          });

          if (expiredCount > 0) {
            this.expiredVisitsSubject.next(expiredCount);
          }
        }
      },
      error: (error) => {
        // Erreur lors de la vérification frontend des visites expirées
      }
    });
  }

  private expireVisit(visitId: string): void {
    this.apiService.updateVisite(visitId, { 
      statut: 'EXPIREE',
      dateFin: new Date()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Visite expirée automatiquement
        }
      },
      error: (error) => {
        // Erreur lors de l'expiration de la visite
      }
    });
  }

  public stopExpirationCheck(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  public getExpiredVisitsCount(): number {
    return this.expiredVisitsSubject.value;
  }
}
