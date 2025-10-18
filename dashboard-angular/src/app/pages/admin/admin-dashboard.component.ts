import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MainLayoutComponent } from '../../components/layout/main-layout.component';
import { EmployeeListComponent } from '../../components/employees/employee-list.component';
import { DepartmentListComponent } from '../../components/departments/department-list.component';
import { VisitorListComponent } from '../../components/visitors/visitor-list.component';
import { VisitListComponent } from '../../components/visits/visit-list.component';
import { BadgeListComponent } from '../../components/badges/badge-list.component';
import { BadgePreviewModalComponent } from '../../components/badges/badge-preview-modal.component';
import { BadgeScanStatsComponent } from '../../components/badge-scan-stats/badge-scan-stats.component';
import { AuditLogsComponent } from '../../components/reports/audit-logs.component';
import { ReportsDashboardComponent } from '../../components/reports/reports-dashboard.component';
import { UserListComponent } from '../../components/users/user-list.component';
import { NavigationService } from '../../services/navigation.service';
import { DashboardUpdateService } from '../../services/dashboard-update.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { VisitExpirationService } from '../../services/visit-expiration.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationSyncService } from '../../services/notification-sync.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NotificationBadgeComponent } from '../../components/notifications/notification-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayoutComponent, EmployeeListComponent, DepartmentListComponent, VisitorListComponent, VisitListComponent, BadgeListComponent, BadgePreviewModalComponent, BadgeScanStatsComponent, AuditLogsComponent, ReportsDashboardComponent, UserListComponent, BaseChartDirective, NotificationBadgeComponent],
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
              <p class="text-xs font-medium text-gray-600 mb-1">Badges Imprimés & Générés</p>
              <p class="text-xl font-bold text-gray-900 mb-1">{{ getTotalBadges() }}</p>
              <p class="text-xs text-purple-600 mb-1">{{ getPrintedBadges() }} imprimés</p>
              <p class="text-xs text-blue-600 mb-2">{{ getGeneratedBadges() }} générés</p>
              <div class="border-t border-gray-200 pt-2 mt-2">
                <p class="text-xs font-medium text-orange-600 mb-1">À Imprimer</p>
                <p class="text-lg font-bold text-orange-600">{{ getBadgesToPrint() }}</p>
              </div>
              <div class="flex items-center text-purple-600 text-xs font-medium group-hover:text-purple-700 mt-2">
                <span>Voir tous</span>
                <span class="material-icons text-xs ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span class="material-icons text-xl mr-2">settings</span>
            Actions Rapides
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button (click)="setActiveTab('visits')" 
                    class="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200">
              <span class="material-icons text-xl mr-3">event</span>
              <span class="font-medium">Gérer les Visites</span>
            </button>
            
            <button (click)="setActiveTab('badges')" 
                    class="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors duration-200">
              <span class="material-icons text-xl mr-3">badge</span>
              <span class="font-medium">Gérer les Badges</span>
            </button>
            
            <button (click)="triggerExpirationCheck()" 
                    [disabled]="isExpiring"
                    class="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed relative">
              <span *ngIf="!isExpiring" class="material-icons text-xl mr-3">schedule</span>
              <span *ngIf="isExpiring" class="material-icons text-xl mr-3 animate-spin">refresh</span>
              <span class="font-medium">{{ isExpiring ? 'Expiration en cours...' : 'Expirer les Visites' }}</span>
              <span *ngIf="visitsToExpireCount > 0 && !isExpiring" 
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {{ visitsToExpireCount }}
              </span>
            </button>
            
          </div>
        </div>

        <!-- Graphiques et tableaux récents -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md border border-blue-200">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-blue-900">Visites Récentes</h3>
            </div>
            <div class="space-y-3" *ngIf="!isLoading; else loadingVisits">
              <div *ngIf="dashboardData.recentActivity?.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="material-icons text-gray-400 text-2xl">event_available</span>
                </div>
                <p class="text-gray-500 text-sm">Aucune visite récente</p>
              </div>
              <div *ngFor="let visit of dashboardData.recentActivity" class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">{{ getInitials(visit.visitorName) }}</span>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">{{ visit.visitorName }}</p>
                    <p class="text-xs text-gray-500">{{ visit.employeeName }} - {{ visit.departmentName }}</p>
                    <p class="text-xs text-blue-600">Début: {{ formatTime(visit.startTime) }}</p>
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
            <h3 class="text-xl font-semibold text-blue-900 mb-6">Statistiques par Département</h3>
            <div class="space-y-4">
              <!-- Graphique Chart.js -->
              <div *ngIf="dashboardData.departmentStats.length > 0; else noDepartmentData" class="bg-white rounded-lg p-4">
                <div class="h-80">
                  <canvas baseChart
                          [data]="barChartData"
                          [options]="barChartOptions"
                          type="bar">
                  </canvas>
                </div>
              </div>
              <ng-template #noDepartmentData>
                <div class="text-center py-4">
                  <span class="material-icons text-gray-400 text-2xl">bar_chart</span>
                  <p class="text-gray-500 text-sm mt-2">Aucune donnée de département</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Statistiques des scans -->
        <div class="mt-8">
          <app-badge-scan-stats></app-badge-scan-stats>
        </div>

        <!-- Top Performers -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Employé le plus visité -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-md border border-green-200">
            <h3 class="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <span class="material-icons text-xl mr-2">star</span>
              Employé le plus visité
            </h3>
            <div *ngIf="dashboardData.mostVisitedEmployee; else noEmployeeData" class="text-center">
              <div class="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl font-bold text-green-700">
                  {{ getInitials(dashboardData.mostVisitedEmployee.name) }}
                </span>
              </div>
              <h4 class="font-semibold text-green-900 mb-1">{{ dashboardData.mostVisitedEmployee.name }}</h4>
              <p class="text-2xl font-bold text-green-600">{{ dashboardData.mostVisitedEmployee.visitCount }}</p>
              <p class="text-sm text-green-600">visites reçues</p>
            </div>
            <ng-template #noEmployeeData>
              <div class="text-center py-4">
                <span class="material-icons text-green-400 text-2xl">person</span>
                <p class="text-green-600 text-sm mt-2">Aucune donnée</p>
              </div>
            </ng-template>
          </div>

          <!-- Visiteur le plus fréquent -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-md border border-purple-200">
            <h3 class="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <span class="material-icons text-xl mr-2">favorite</span>
              Visiteur le plus fréquent
            </h3>
            <div *ngIf="dashboardData.mostFrequentVisitor; else noVisitorData" class="text-center">
              <div class="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl font-bold text-purple-700">
                  {{ getInitials(dashboardData.mostFrequentVisitor.name) }}
                </span>
              </div>
              <h4 class="font-semibold text-purple-900 mb-1">{{ dashboardData.mostFrequentVisitor.name }}</h4>
              <p class="text-2xl font-bold text-purple-600">{{ dashboardData.mostFrequentVisitor.visitCount }}</p>
              <p class="text-sm text-purple-600">visites effectuées</p>
            </div>
            <ng-template #noVisitorData>
              <div class="text-center py-4">
                <span class="material-icons text-purple-400 text-2xl">person</span>
                <p class="text-purple-600 text-sm mt-2">Aucune donnée</p>
              </div>
            </ng-template>
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

      <!-- Rapports -->
      <div *ngIf="activeTab === 'reports'" class="min-h-full">
        <app-reports-dashboard></app-reports-dashboard>
      </div>
      
      <!-- Composant de notification -->
      <app-notification-badge></app-notification-badge>
      
      <!-- Badge Preview Modal -->
      <app-badge-preview-modal></app-badge-preview-modal>
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
      employeeName: string;
      departmentName: string;
      startTime: string;
      status: string;
    }>,
    departmentStats: [] as Array<{
      departmentName: string;
      visitCount: number;
    }>,
    mostVisitedEmployee: null as any,
    mostFrequentVisitor: null as any
  };
  isLoading = false;
  isExpiring = false;
  visitsToExpireCount = 0;
  badges: any[] = [];
  

  // Configuration du graphique
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Visites par Département'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Départements'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          }
        },
        title: {
          display: true,
          text: 'Nombre de visites'
        }
      }
    }
  };

  public barChartLabels: string[] = [];
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Visites',
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private toastService: ToastService,
    private apiService: ApiService,
    private stateService: StateService,
    private visitExpirationService: VisitExpirationService,
    private dashboardUpdateService: DashboardUpdateService,
    private notificationService: NotificationService,
    private notificationSyncService: NotificationSyncService
  ) {}

  ngOnInit() {
    // S'assurer que la vue d'ensemble est affichée par défaut
    this.activeTab = 'overview';
    this.navigationService.setActiveTab('overview');

    // Écouter les changements de navigation depuis le menu
    this.navigationSubscription = this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });

    // Écouter les changements d'état des employés pour mettre à jour les statistiques
    this.stateService.employees$.subscribe(employees => {
      if (employees && employees.length > 0) {
        this.dashboardData.totalEmployees = employees.filter(emp => emp.isActive).length;
      }
    });

    // Charger les données du dashboard
    this.loadDashboardData();

    // Charger le nombre de visites à expirer
    this.loadVisitsToExpireCount();

    // Écouter les mises à jour du dashboard (après scan de badge, etc.)
    this.dashboardUpdateService.dashboardUpdate$.subscribe(() => {
      this.loadDashboardData();
    });

    // Les notifications sont maintenant gérées par VisitMonitoringService

    // Écouter les visites expirées
    this.visitExpirationService.expiredVisits$.subscribe(count => {
      if (count > 0) {
        this.toastService.info(
          'Visites expirées',
          `${count} visite(s) ont été automatiquement expirées`,
          5000
        );
        // Recharger les données du dashboard
        this.loadDashboardData();
        // Recharger le nombre de visites à expirer
        this.loadVisitsToExpireCount();
      }
    });

    // Écouter les mises à jour (création/modification) de visites et recharger le dashboard
    this.dashboardUpdateService.dashboardUpdate$.subscribe(() => {
      this.loadDashboardData();
      this.loadVisitsToExpireCount();
    });

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

  // Méthode pour charger le nombre de visites à expirer
  private loadVisitsToExpireCount(): void {
    this.apiService.countVisitsToExpire().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.visitsToExpireCount = response.data.count;
        }
      },
      error: (error) => {
        this.visitsToExpireCount = 0;
      }
    });
  }

  // Méthode pour déclencher manuellement l'expiration des visites
  triggerExpirationCheck(): void {
    this.isExpiring = true;
    
    this.apiService.triggerExpirationCheck().subscribe({
      next: (response) => {
        this.isExpiring = false;
        if (response.success && response.data) {
          const { expiredCount, message } = response.data;
          if (expiredCount > 0) {
            this.toastService.success(
              'Expiration manuelle',
              `${expiredCount} visite(s) ont été expirées`,
              5000
            );
            // Recharger les données du dashboard
            this.loadDashboardData();
            // Recharger le nombre de visites à expirer
            this.loadVisitsToExpireCount();
          } else {
            this.toastService.info(
              'Expiration manuelle',
              'Aucune visite à expirer',
              3000
            );
          }
        }
      },
      error: (error) => {
        this.isExpiring = false;
        this.toastService.error(
          'Erreur',
          'Erreur lors de l\'expiration des visites',
          5000
        );
      }
    });
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
        // Calculer les visites actives et Visites aujourd'hui (terminées ou expirées aujourd'hui)
        const today = new Date();
        const isSameLocalDay = (d1: Date, d2: Date) => (
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
        );
        this.dashboardData.activeVisits = Array.isArray(visitsData)
          ? visitsData.filter((v: any) => v?.statut === 'EN_COURS').length
          : 0;
        // Aligner avec la recherche (date d'entrée)
        this.dashboardData.todayVisits = Array.isArray(visitsData)
          ? visitsData.filter((v: any) => {
              if (!v?.dateDebut) return false;
              const startedToday = isSameLocalDay(new Date(v.dateDebut), today);
              const isCompleted = v?.statut === 'TERMINEE' || v?.statut === 'EXPIREE';
              const isClosedBadge = v?.badge?.status === 'CLOSED';
              return isCompleted && isClosedBadge && startedToday;
            }).length
          : 0;
        // Populate recent activity - only EN_COURS visits from today
        this.dashboardData.recentActivity = Array.isArray(visitsData) ? visitsData
          .filter((v: any) => {
            if (!v?.dateDebut) return false;
            const visitDate = new Date(v.dateDebut);
            return v.statut === 'EN_COURS' && isSameLocalDay(visitDate, today);
          })
          .sort((a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
          .slice(0, 5)
          .map((v: any) => ({
            visitorName: `${v.visiteur?.prenom || ''} ${v.visiteur?.nom || ''}`,
            employeeName: `${v.employe?.prenom || ''} ${v.employe?.nom || ''}`,
            departmentName: v.employe?.department?.nom || 'Non assigné',
            startTime: v.dateDebut,
            status: v.statut
          })) : [];

        // Calculer les nouvelles statistiques
        if (Array.isArray(visitsData)) {
          this.calculateDepartmentStats(visitsData);
          this.calculateMostVisitedEmployee(visitsData);
          this.calculateMostFrequentVisitor(visitsData);
        }
      }

      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Charger les badges
      const badges = await this.apiService.getBadges({ page: 1, limit: 1000 }).toPromise();
      if (badges?.success) {
        const badgesData = badges.data?.data || badges.data || [];
        this.dashboardData.totalBadges = Array.isArray(badgesData) ? badgesData.length : 0;
        this.badges = Array.isArray(badgesData) ? badgesData : [];
      }
      
      // Calculer les statistiques dynamiques
      this.calculateStatistics();
      this.isLoading = false;
    } catch (error) {
      this.toastService.error('Erreur', 'Erreur lors du chargement des données du dashboard');
      this.isLoading = false;
    }
  }

  calculateStatistics() {
    // Calculer le taux d'occupation basé sur les vraies données
    // TODO: Récupérer la capacité réelle depuis la base de données
    // Pour l'instant, on affiche 0 si pas de données réelles
    if (this.dashboardData.activeVisits > 0) {
      // TODO: Remplacer par la vraie capacité depuis la base de données
      const capacity = 100; // Valeur temporaire
      this.dashboardData.occupationRate = Math.min(Math.round((this.dashboardData.activeVisits / capacity) * 100), 100);
    } else {
      this.dashboardData.occupationRate = 0;
    }
    
    // Calculer le taux de satisfaction basé sur les vraies données
    // TODO: Récupérer les données de satisfaction réelles depuis la base de données
    // Pour l'instant, on affiche 0 si pas de données réelles
    if (this.dashboardData.totalVisits > 0) {
      // TODO: Remplacer par le calcul réel basé sur les visites terminées avec satisfaction
      this.dashboardData.satisfactionRate = 0; // Pas de données de satisfaction pour l'instant
    } else {
      this.dashboardData.satisfactionRate = 0;
    }
    
  }

  // Helper methods for recent visits
  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(dateString: string): string {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  getDepartmentPercentage(visitCount: number): number {
    if (this.dashboardData.departmentStats.length === 0) return 0;
    const maxVisits = Math.max(...this.dashboardData.departmentStats.map(d => d.visitCount));
    return maxVisits > 0 ? (visitCount / maxVisits) * 100 : 0;
  }

  private calculateDepartmentStats(visits: any[]): void {
    const departmentMap = new Map<string, number>();
    
    // Filtrer uniquement les visites terminées ou expirées (badges fermés)
    const completedVisits = visits.filter(visit => 
      (visit.statut === 'TERMINEE' || visit.statut === 'EXPIREE') && 
      visit.badge?.status === 'CLOSED'
    );
    
    completedVisits.forEach(visit => {
      if (visit.employe?.department?.nom) {
        const deptName = visit.employe.department.nom;
        departmentMap.set(deptName, (departmentMap.get(deptName) || 0) + 1);
      }
    });

    this.dashboardData.departmentStats = Array.from(departmentMap.entries())
      .map(([departmentName, visitCount]) => ({ departmentName, visitCount }))
      .sort((a, b) => b.visitCount - a.visitCount);

    // Mettre à jour les données du graphique
    this.updateChartData();
  }

  private updateChartData(): void {
    this.barChartLabels = this.dashboardData.departmentStats.map(dept => dept.departmentName);
    this.barChartData = {
      ...this.barChartData,
      labels: this.barChartLabels,
      datasets: [{
        ...this.barChartData.datasets[0],
        data: this.dashboardData.departmentStats.map(dept => dept.visitCount)
      }]
    };
  }

  private calculateMostVisitedEmployee(visits: any[]): void {
    const employeeMap = new Map<string, { name: string; count: number }>();
    
    // Filtrer uniquement les visites terminées ou expirées (badges fermés)
    const completedVisits = visits.filter(visit => 
      (visit.statut === 'TERMINEE' || visit.statut === 'EXPIREE') && 
      visit.badge?.status === 'CLOSED'
    );
    
    completedVisits.forEach(visit => {
      if (visit.employe) {
        const employeeId = visit.employe.id;
        const employeeName = `${visit.employe.prenom} ${visit.employe.nom}`;
        const current = employeeMap.get(employeeId) || { name: employeeName, count: 0 };
        employeeMap.set(employeeId, { name: employeeName, count: current.count + 1 });
      }
    });

    const mostVisited = Array.from(employeeMap.values())
      .sort((a, b) => b.count - a.count)[0];

    this.dashboardData.mostVisitedEmployee = mostVisited ? {
      name: mostVisited.name,
      visitCount: mostVisited.count
    } : null;
  }

  private calculateMostFrequentVisitor(visits: any[]): void {
    const visitorMap = new Map<string, { name: string; count: number }>();
    
    // Filtrer uniquement les visites terminées ou expirées (badges fermés)
    const completedVisits = visits.filter(visit => 
      (visit.statut === 'TERMINEE' || visit.statut === 'EXPIREE') && 
      visit.badge?.status === 'CLOSED'
    );
    
    completedVisits.forEach(visit => {
      if (visit.visiteur) {
        const visitorId = visit.visiteur.id;
        const visitorName = `${visit.visiteur.prenom} ${visit.visiteur.nom}`;
        const current = visitorMap.get(visitorId) || { name: visitorName, count: 0 };
        visitorMap.set(visitorId, { name: visitorName, count: current.count + 1 });
      }
    });

    const mostFrequent = Array.from(visitorMap.values())
      .sort((a, b) => b.count - a.count)[0];

    this.dashboardData.mostFrequentVisitor = mostFrequent ? {
      name: mostFrequent.name,
      visitCount: mostFrequent.count
    } : null;
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

  // Méthodes pour calculer les badges
  getTotalBadges(): number {
    if (!this.badges || this.badges.length === 0) return 0;
    return this.badges.filter(badge => 
      (badge.status === 'GENERATED' || 
       badge.status === 'PRINTED' || 
       badge.status === 'CLOSED') &&
      badge.visite?.visiteur && badge.visite?.employe
    ).length;
  }

  getPrintedBadges(): number {
    if (!this.badges || this.badges.length === 0) return 0;
    return this.badges.filter(badge => 
      badge.status === 'PRINTED' &&
      badge.visite?.visiteur && badge.visite?.employe
    ).length;
  }

  getGeneratedBadges(): number {
    if (!this.badges || this.badges.length === 0) return 0;
    return this.badges.filter(badge => 
      badge.status === 'GENERATED' &&
      badge.visite?.visiteur && badge.visite?.employe
    ).length;
  }

  getBadgesToPrint(): number {
    if (!this.badges || this.badges.length === 0) return 0;
    return this.badges.filter(badge => 
      badge.status === 'GENERATED' &&
      badge.visite?.visiteur && badge.visite?.employe
    ).length;
  }

  // Charger les départements

}



