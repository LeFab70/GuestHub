import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MainLayoutComponent } from '../../components/layout/main-layout.component';
import { EmployeeListComponent } from '../../components/employees/employee-list.component';
import { DepartmentListComponent } from '../../components/departments/department-list.component';
import { VisitorListComponent } from '../../components/visitors/visitor-list.component';
import { VisitListComponent } from '../../components/visits/visit-list.component';
import { BadgeListComponent } from '../../components/badges/badge-list.component';
import { AuditLogsComponent } from '../../components/reports/audit-logs.component';
import { UserListComponent } from '../../components/users/user-list.component';
import { NavigationService } from '../../services/navigation.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, EmployeeListComponent, DepartmentListComponent, VisitorListComponent, VisitListComponent, BadgeListComponent, AuditLogsComponent, UserListComponent],
  template: `
    <app-main-layout>
      <!-- Vue d'ensemble -->
      <div *ngIf="activeTab === 'overview'" class="min-h-full flex flex-col space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-3 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('employees')">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <span class="material-icons text-xl">people</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700">
                <span class="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600 mb-1">Employés Actifs</p>
              <p class="text-xl font-bold text-gray-900 mb-1">{{ dashboardData.totalEmployees }}</p>
              <p class="text-xs text-green-600 mb-2" *ngIf="!isLoading">Enregistrés</p>
              <div class="flex items-center text-blue-600 text-xs font-medium group-hover:text-blue-700">
                <span>Voir tous</span>
                <span class="material-icons text-xs ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-3 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visitors')">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <span class="material-icons text-xl">person</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-600 hover:text-green-700">
                <span class="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600 mb-1">Total Visiteurs</p>
              <p class="text-xl font-bold text-gray-900 mb-1">{{ dashboardData.totalVisitors }}</p>
              <p class="text-xs text-green-600 mb-2" *ngIf="!isLoading">Enregistrés</p>
              <div class="flex items-center text-green-600 text-xs font-medium group-hover:text-green-700">
                <span>Voir tous</span>
                <span class="material-icons text-xs ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-3 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visits')">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <span class="material-icons text-xl">event</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-600 hover:text-yellow-700">
                <span class="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600 mb-1">Visites Aujourd'hui</p>
              <p class="text-xl font-bold text-gray-900 mb-1">{{ dashboardData.todayVisits }}</p>
              <p class="text-xs text-blue-600 mb-2" *ngIf="!isLoading">{{ dashboardData.activeVisits }} en cours</p>
              <div class="flex items-center text-yellow-600 text-xs font-medium group-hover:text-yellow-700">
                <span>Voir toutes</span>
                <span class="material-icons text-xs ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-3 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('badges')">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <span class="material-icons text-xl">badge</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-600 hover:text-purple-700">
                <span class="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600 mb-1">Total Badges</p>
              <p class="text-xl font-bold text-gray-900 mb-1">{{ dashboardData.totalBadges }}</p>
              <p class="text-xs text-purple-600 mb-2" *ngIf="!isLoading">Générés</p>
              <div class="flex items-center text-purple-600 text-xs font-medium group-hover:text-purple-700">
                <span>Voir tous</span>
                <span class="material-icons text-xs ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphiques et tableaux récents -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md border border-blue-200">
            <h3 class="text-xl font-semibold text-blue-900 mb-6">Visites Récentes</h3>
            <div class="space-y-3" *ngIf="!isLoading; else loadingVisits">
              <div *ngIf="dashboardData.recentActivity.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="material-icons text-gray-400 text-2xl">event_available</span>
                </div>
                <p class="text-gray-500 text-sm">Aucune visite récente</p>
              </div>
              <div *ngFor="let visit of dashboardData.recentActivity" class="flex items-center justify-between py-2 border-b border-gray-100">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">{{ getInitials(visit.visitorName) }}</span>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">{{ visit.visitorName }}</p>
                    <p class="text-xs text-gray-500">{{ visit.departmentName }}</p>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" 
                      [class]="getStatusClass(visit.status)">
                  {{ getStatusLabel(visit.status) }}
                </span>
              </div>
            </div>
            <ng-template #loadingVisits>
              <div class="space-y-3">
                <div *ngFor="let i of [1,2,3]" class="animate-pulse">
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div class="ml-3">
                        <div class="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                        <div class="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>

          <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-2xl shadow-md border border-blue-300">
            <h3 class="text-xl font-semibold text-blue-900 mb-6">Statistiques</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Taux d'occupation</span>
                <span class="text-sm font-medium text-gray-900">{{ dashboardData.occupationRate }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="dashboardData.occupationRate"></div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Visiteurs satisfaits</span>
                <span class="text-sm font-medium text-gray-900">{{ dashboardData.satisfactionRate }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" [style.width.%]="dashboardData.satisfactionRate"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Employés -->
      <div *ngIf="activeTab === 'employees'" class="min-h-full">
        <app-employee-list></app-employee-list>
      </div>

      <!-- Départements -->
      <div *ngIf="activeTab === 'departments'" class="min-h-full">
        <app-department-list></app-department-list>
      </div>

      <!-- Visiteurs -->
      <div *ngIf="activeTab === 'visitors'" class="min-h-full">
        <app-visitor-list></app-visitor-list>
      </div>

      <!-- Visites -->
      <div *ngIf="activeTab === 'visits'" class="min-h-full">
        <app-visit-list></app-visit-list>
      </div>

      <!-- Badges -->
      <div *ngIf="activeTab === 'badges'" class="min-h-full">
        <app-badge-list></app-badge-list>
      </div>

      <!-- Utilisateurs -->
      <div *ngIf="activeTab === 'users'" class="min-h-full">
        <app-user-list></app-user-list>
      </div>

      <!-- Audit -->
      <div *ngIf="activeTab === 'audit'" class="min-h-full">
        <app-audit-logs></app-audit-logs>
      </div>
    </app-main-layout>
  `,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  private navigationSubscription: Subscription = new Subscription();
  private welcomeShown = false;
  
  // Dashboard data
  dashboardData = {
    totalEmployees: 0,
    totalVisitors: 0,
    totalVisits: 0,
    totalBadges: 0,
    activeVisits: 0,
    todayVisits: 0,
    occupationRate: 0,
    satisfactionRate: 0,
    recentActivity: [] as Array<{
      visitorName: string;
      departmentName: string;
      status: string;
    }>
  };
  isLoading = false;

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private toastService: ToastService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // S'assurer que la vue d'ensemble est affichée par défaut
    this.activeTab = 'overview';
    this.navigationService.setActiveTab('overview');

    // Écouter les changements de navigation depuis le menu
    this.navigationSubscription = this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });

    // Charger les données du dashboard
    this.loadDashboardData();

    // Afficher le toast de bienvenue si c'est la première fois
    this.showWelcomeToastIfNeeded();
  }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }

  // Méthode pour changer d'onglet depuis le menu
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  private loadDashboardData() {
    this.isLoading = true;
    
    // Charger les données de manière séquentielle pour éviter le rate limiting
    this.loadDataSequentially();
  }

  private async loadDataSequentially() {
    try {
      // Charger seulement les employés actifs
      const employees = await this.apiService.getEmployes({ status: 'active' }).toPromise();
      if (employees?.success) {
        const employeesData = employees.data?.data || employees.data || [];
        this.dashboardData.totalEmployees = Array.isArray(employeesData) ? employeesData.length : 0;
      }

      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Charger les visiteurs
      const visitors = await this.apiService.getVisiteurs().toPromise();
      if (visitors?.success) {
        const visitorsData = visitors.data?.data || visitors.data || [];
        this.dashboardData.totalVisitors = Array.isArray(visitorsData) ? visitorsData.length : 0;
      }

      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Charger les visites
      const visits = await this.apiService.getVisites().toPromise();
      if (visits?.success) {
        const visitsData = visits.data?.data || visits.data || [];
        this.dashboardData.totalVisits = Array.isArray(visitsData) ? visitsData.length : 0;
        // Calculer les visites actives et d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.dashboardData.activeVisits = Array.isArray(visitsData) ? visitsData.filter((v: any) => v.status === 'EN_COURS').length : 0;
        this.dashboardData.todayVisits = Array.isArray(visitsData) ? visitsData.filter((v: any) => {
          const visitDate = new Date(v.dateEntree);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate.getTime() === today.getTime();
        }).length : 0;
        // Populate recent activity
        this.dashboardData.recentActivity = Array.isArray(visitsData) ? visitsData.slice(0, 5).map((v: any) => ({
          visitorName: `${v.visiteur.prenom} ${v.visiteur.nom}`,
          departmentName: v.employe.department.nom,
          status: v.statut
        })) : [];
      }

      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Charger les badges
      const badges = await this.apiService.getBadges().toPromise();
      if (badges?.success) {
        const badgesData = badges.data?.data || badges.data || [];
        this.dashboardData.totalBadges = Array.isArray(badgesData) ? badgesData.length : 0;
      }
      
      // Calculer les statistiques dynamiques
      this.calculateStatistics();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.toastService.error('Erreur', 'Erreur lors du chargement des données du dashboard');
      this.isLoading = false;
    }
  }

  calculateStatistics() {
    // Calculer le taux d'occupation (visites actives / capacité totale)
    // Pour simplifier, on considère que la capacité est de 100 personnes
    const capacity = 100;
    this.dashboardData.occupationRate = Math.min(Math.round((this.dashboardData.activeVisits / capacity) * 100), 100);
    
    // Calculer le taux de satisfaction (visites terminées / total visites)
    // Pour simplifier, on considère que 85% des visites sont satisfaisantes
    if (this.dashboardData.totalVisits > 0) {
      this.dashboardData.satisfactionRate = Math.round((this.dashboardData.totalVisits * 0.85) / this.dashboardData.totalVisits * 100);
    } else {
      this.dashboardData.satisfactionRate = 0;
    }
  }

  // Helper methods for recent visits
  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS':
        return 'text-green-600 bg-green-100';
      case 'TERMINE':
        return 'text-gray-600 bg-gray-100';
      case 'ANNULE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminée';
      case 'ANNULE':
        return 'Annulée';
      default:
        return 'En attente';
    }
  }

  private showWelcomeToastIfNeeded(): void {
    if (this.welcomeShown) return;
    
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Vérifier si c'est une nouvelle session (pas de lastLogin dans localStorage)
    const sessionKey = `welcome_shown_${user.id}`;
    const hasShownWelcome = localStorage.getItem(sessionKey);
    
    if (!hasShownWelcome) {
      this.showWelcomeToast(user);
      localStorage.setItem(sessionKey, 'true');
      this.welcomeShown = true;
    }
  }

  private showWelcomeToast(user: User): void {
    const now = new Date();
    const lastLogin = user.previousLogin ? new Date(user.previousLogin) : null;
    
    let message = `Bienvenue ${user.prenom} ${user.nom} !`;
    
    if (lastLogin) {
      const timeDiff = now.getTime() - lastLogin.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      
      let timeAgo = '';
      if (daysDiff > 0) {
        timeAgo = `il y a ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`;
      } else if (hoursDiff > 0) {
        timeAgo = `il y a ${hoursDiff} heure${hoursDiff > 1 ? 's' : ''}`;
      } else if (minutesDiff > 0) {
        timeAgo = `il y a ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
      } else {
        timeAgo = 'à l\'instant';
      }
      
      message += `\nDernière connexion : ${timeAgo}`;
    } else {
      message += '\nPremière connexion !';
    }
    
    this.toastService.success(
      'Connexion réussie',
      message,
      8000 // 8 secondes pour laisser le temps de lire
    );
  }
}



