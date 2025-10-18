import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, interval, switchMap, startWith, takeUntil, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VisitMonitoringService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  private isMonitoring = false;
  private newVisitsSubject = new BehaviorSubject<number>(0);
  
  public newVisits$ = this.newVisitsSubject.asObservable();

  constructor() {
    // Écouter les changements d'authentification
    this.authService.currentUser$.subscribe(user => {
      if (user && !this.isMonitoring) {
        this.startMonitoring();
      } else if (!user && this.isMonitoring) {
        this.stopMonitoring();
      }
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) {
      return; // Éviter les doublons
    }
    
    this.isMonitoring = true;

    // Vérifier toutes les 30 secondes pour éviter le rate limiting
    interval(30000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.apiService.getRecentVisits()),
      startWith({ data: { visits: [] } })
    ).subscribe({
      next: (response) => {
        const newVisits = response.data?.visits || [];
        const newVisitsCount = newVisits.length;
        
        if (newVisitsCount > 0) {
          this.newVisitsSubject.next(newVisitsCount);
        }
      },
      error: (error) => {
        // Erreur lors de la surveillance des visites
      }
    });
  }

  private stopMonitoring(): void {
    this.isMonitoring = false;
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$ = new Subject<void>(); // Recréer pour la prochaine connexion
  }

  // Méthode pour déclencher manuellement une notification
  triggerNewVisitNotification(count: number = 1): void {
    this.newVisitsSubject.next(count);
  }

  // Réinitialiser la surveillance (appelé après connexion)
  resetVisitMonitoring(): void {
    this.newVisitsSubject.next(0);
  }
}

