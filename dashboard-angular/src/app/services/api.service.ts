import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, startWith, takeUntil, Subject } from 'rxjs';
import { User, Employe, Visiteur, Departement, Visite, Badge, Role, Permission, AuditLog } from '../models/user.model';
import { DashboardUpdateService } from './dashboard-update.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api';
  private dashboardUpdateService = inject(DashboardUpdateService);

  constructor(private http: HttpClient) {
    // La surveillance des visites est maintenant gérée par VisitMonitoringService
  }

  // Authentication
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {});
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/profile`);
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  // Initialization
  getInitStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/init/status`);
  }

  initializeApp(adminData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/init/initialize`, adminData);
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/users`);
  }

  createUser(user: Partial<User>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, user);
  }

  createAdmin(user: Partial<User>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/users/admin`, user);
  }

  createReceptionist(user: Partial<User>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/users/receptionist`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/auth/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/auth/users/${id}`);
  }

  // Employes
  getEmployes(params?: any): Observable<any> {
    let url = `${this.baseUrl}/employees`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return this.http.get<any>(url);
  }

  createEmploye(employe: Partial<Employe>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employees`, employe);
  }

  updateEmploye(id: string, employe: Partial<Employe>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/employees/${id}`, employe);
  }

  deactivateEmploye(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/employees/${id}/deactivate`, {});
  }

  activateEmploye(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/employees/${id}/activate`, {});
  }

  deleteEmploye(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }

  // Visiteurs
  getVisiteurs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visitors`);
  }

  createVisiteur(visiteur: Partial<Visiteur>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/visitors`, visiteur);
  }

  updateVisiteur(id: string, visiteur: Partial<Visiteur>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/visitors/${id}`, visiteur);
  }

  deleteVisiteur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/visitors/${id}`);
  }

  // Departements
  getDepartements(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/departments`);
  }

  createDepartement(departement: Partial<Departement>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/departments`, departement);
  }

  createDepartementWithSuggestion(departement: Partial<Departement>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/departments/with-suggestion`, departement);
  }

  updateDepartement(id: string, departement: Partial<Departement>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/departments/${id}`, departement);
  }

  deleteDepartement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`);
  }

  // Visites
  getVisites(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visits`);
  }

  createVisite(visite: Partial<Visite>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/visits`, visite);
  }

  updateVisite(id: string, visite: Partial<Visite>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/visits/${id}`, visite);
  }

  deleteVisite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/visits/${id}`);
  }

  checkInVisit(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/visits/${id}/check-in`, {});
  }

  checkOutVisit(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/visits/${id}/check-out`, {});
  }

  // Badges
  getBadges(params?: any): Observable<any> {
    let url = `${this.baseUrl}/badges`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return this.http.get<any>(url);
  }

  scanBadge(qrCode: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/badges/scan`, { qrCode });
  }

  updateBadge(id: string, badge: Partial<Badge>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/badges/${id}`, badge);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, role);
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/roles/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions`);
  }

  createPermission(permission: Partial<Permission>): Observable<Permission> {
    return this.http.post<Permission>(`${this.baseUrl}/permissions`, permission);
  }

  updatePermission(id: number, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<Permission>(`${this.baseUrl}/permissions/${id}`, permission);
  }

  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/permissions/${id}`);
  }

  // Audit Logs
  getAuditLogs(page: number = 1, limit: number = 10, filters: any = {}): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    if (filters.action) params.set('action', filters.action);
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    
    return this.http.get<any>(`${this.baseUrl}/audit/logs?${params.toString()}`);
  }

  getAuditLogById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/audit/logs/${id}`);
  }

  getAuditStats(filters: any = {}): Observable<any> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    
    return this.http.get<any>(`${this.baseUrl}/audit/stats?${params.toString()}`);
  }

  // Dashboard data
  getAdminDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard`);
  }

  getReceptionDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reception/dashboard`);
  }

  // Password reset methods
  resetUserPassword(userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password/${userId}`, {});
  }

  setNewPassword(userId: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/set-new-password`, {
      userId,
      newPassword
    });
  }

  // Badge methods
  printBadge(badgeId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/badges/${badgeId}/print`, {});
  }

  useBadge(badgeId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/badges/${badgeId}/use`, {});
  }

  returnBadge(badgeId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/badges/${badgeId}/return`, {});
  }

  // Visit expiration methods
  triggerExpirationCheck(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/visit-expiration/check`, {});
  }

  getExpirationStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visit-expiration/status`);
  }

  countVisitsToExpire(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visit-expiration/count`);
  }

  // Visit statistics
  getVisitStatistics(dateFrom: string, dateTo: string, criteria: string): Observable<any> {
    const params = new URLSearchParams();
    params.set('dateFrom', dateFrom);
    params.set('dateTo', dateTo);
    params.set('criteria', criteria);
    
    return this.http.get<any>(`${this.baseUrl}/visit-statistics/statistics?${params.toString()}`);
  }

  // Obtenir les visites récentes (pour les notifications)
  getRecentVisits(): Observable<any> {
    const since = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
    return this.http.get<any>(`${this.baseUrl}/visits/recent?since=${since.toISOString()}`);
  }

  // Obtenir les visites récentes avec un timestamp spécifique
  getRecentVisitsWithTimestamp(since: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/visits/recent?since=${since}`);
  }
}
