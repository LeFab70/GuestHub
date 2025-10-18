import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardUpdateService {
  private dashboardUpdateSubject = new Subject<void>();
  
  // Observable pour écouter les mises à jour
  dashboardUpdate$ = this.dashboardUpdateSubject.asObservable();
  
  // Méthode pour déclencher une mise à jour
  triggerDashboardUpdate(): void {
    this.dashboardUpdateSubject.next();
  }
}
