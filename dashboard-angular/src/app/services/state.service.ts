import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Observables pour les données partagées
  private employeesSubject = new BehaviorSubject<any[]>([]);
  private departmentsSubject = new BehaviorSubject<any[]>([]);
  private visitorsSubject = new BehaviorSubject<any[]>([]);
  private visitsSubject = new BehaviorSubject<any[]>([]);
  private usersSubject = new BehaviorSubject<any[]>([]);
  private badgesSubject = new BehaviorSubject<any[]>([]);

  // Observables publics
  public employees$ = this.employeesSubject.asObservable();
  public departments$ = this.departmentsSubject.asObservable();
  public visitors$ = this.visitorsSubject.asObservable();
  public visits$ = this.visitsSubject.asObservable();
  public users$ = this.usersSubject.asObservable();
  public badges$ = this.badgesSubject.asObservable();

  // Méthodes pour mettre à jour les données
  updateEmployees(employees: any[]) {
    this.employeesSubject.next(employees);
  }

  updateDepartments(departments: any[]) {
    this.departmentsSubject.next(departments);
  }

  updateVisitors(visitors: any[]) {
    this.visitorsSubject.next(visitors);
  }

  updateVisits(visits: any[]) {
    this.visitsSubject.next(visits);
  }

  updateUsers(users: any[]) {
    this.usersSubject.next(users);
  }

  updateBadges(badges: any[]) {
    this.badgesSubject.next(badges);
  }

  // Méthodes pour obtenir les données actuelles
  getCurrentEmployees(): any[] {
    return this.employeesSubject.value;
  }

  getCurrentDepartments(): any[] {
    return this.departmentsSubject.value;
  }

  getCurrentVisitors(): any[] {
    return this.visitorsSubject.value;
  }

  getCurrentVisits(): any[] {
    return this.visitsSubject.value;
  }

  getCurrentUsers(): any[] {
    return this.usersSubject.value;
  }

  getCurrentBadges(): any[] {
    return this.badgesSubject.value;
  }

  // Méthode pour rafraîchir toutes les données
  refreshAll() {
    // Émettre un événement pour forcer le rafraîchissement
    this.employeesSubject.next([...this.employeesSubject.value]);
    this.departmentsSubject.next([...this.departmentsSubject.value]);
    this.visitorsSubject.next([...this.visitorsSubject.value]);
    this.visitsSubject.next([...this.visitsSubject.value]);
    this.usersSubject.next([...this.usersSubject.value]);
    this.badgesSubject.next([...this.badgesSubject.value]);
  }
}
