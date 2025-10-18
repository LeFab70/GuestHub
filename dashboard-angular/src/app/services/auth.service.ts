import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NavigationService } from './navigation.service';
import { ApiService } from './api.service';

export interface User {
  id: string;
  login: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONNISTE' | 'USER';
  nom: string;
  prenom: string;
  lastLogin?: Date;
  previousLogin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private apiService: ApiService
  ) {
    // Vérifier si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap((response) => {
        if (response.success && response.data) {
          // Check if password reset is required
          if (response.data.passwordResetRequired) {
            // Don't store user or redirect if password reset is required
            // The login component will handle showing the reset modal
            return;
          }

          const user: User = {
            id: response.data.user.id,
            login: response.data.user.username,
            email: response.data.user.email,
            role: response.data.user.role,
            nom: response.data.user.lastName,
            prenom: response.data.user.firstName,
            lastLogin: new Date()
          };

          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('accessToken', response.data.accessToken);
          
          // Réinitialiser la navigation à la vue d'ensemble
          this.navigationService.setActiveTab('overview');
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken'); // Corriger: utiliser 'accessToken' au lieu de 'token'
    if (!token) {
      return false;
    }
    
    // Vérifier si le token est expiré
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        this.logout();
        return false;
      }
    } catch (error) {
      this.logout();
      return false;
    }
    
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: 'ADMIN' | 'RECEPTIONNISTE' | 'USER'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Méthodes pour l'initialisation
  getInitStatus(): Observable<any> {
    return this.apiService.getInitStatus();
  }

  initializeApp(adminData: any): Observable<any> {
    return this.apiService.initializeApp(adminData);
  }

  updateUser(updatedUser: User): void {
    this.currentUserSubject.next(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
}
