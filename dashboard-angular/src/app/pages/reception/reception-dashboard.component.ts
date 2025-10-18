import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MainLayoutComponent } from '../../components/layout/main-layout.component';
import { VisitListComponent } from '../../components/visits/visit-list.component';
import { VisitorListComponent } from '../../components/visitors/visitor-list.component';
import { BadgeListComponent } from '../../components/badges/badge-list.component';
import { BadgePreviewModalComponent } from '../../components/badges/badge-preview-modal.component';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';
import { BadgeScanStatsComponent } from '../../components/badge-scan-stats/badge-scan-stats.component';
import { ReportsDashboardComponent } from '../../components/reports/reports-dashboard.component';
import { NavigationService } from '../../services/navigation.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { DashboardUpdateService } from '../../services/dashboard-update.service';
import { VisitExpirationService } from '../../services/visit-expiration.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationSyncService } from '../../services/notification-sync.service';
import { NotificationBadgeComponent } from '../../components/notifications/notification-badge.component';

interface ReceptionStats {
  todayVisits: number;
  pendingVisits: number;
  activeVisitors: number;
  newVisitorsToday: number;
  badgesToPrint: number;
  urgentBadges: number;
  pendingCheckouts: number;
  recentVisits: Array<{
    visitorName: string;
    employeeName: string;
    departmentName: string;
    startTime: string;
    status: string;
  }>;
}

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayoutComponent, VisitListComponent, VisitorListComponent, BadgeListComponent, BadgePreviewModalComponent, QrScannerComponent, BadgeScanStatsComponent, ReportsDashboardComponent, NotificationBadgeComponent],
  template: `
    <app-main-layout>
      
      <!-- Vue d'ensemble -->
      <div *ngIf="activeTab === 'overview'" class="min-h-full flex flex-col space-y-6">
        <!-- Actions rapides -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-md border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center">
              <div class="p-5 rounded-full bg-sky-100 text-sky-600">
                <span class="material-icons text-4xl">check_circle</span>
              </div>
              <div class="ml-6 flex-1">
                <h4 class="text-xl font-semibold text-sky-900 mb-2">Check-in Visite Planifiée</h4>
                <p class="text-base text-sky-700 mb-6">Valider une visite prévue par un administrateur</p>
                <button (click)="activeTab = 'visits'" 
                        class="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-150 text-base font-medium">
                  Valider Visite
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center">
              <div class="p-5 rounded-full bg-gray-100 text-gray-600">
                <span class="material-icons text-4xl">add_circle</span>
              </div>
              <div class="ml-6 flex-1">
                <h4 class="text-xl font-semibold text-gray-900 mb-2">Nouvelle Visite</h4>
                <p class="text-base text-gray-700 mb-6">Créer une nouvelle visite pour un visiteur</p>
                <button (click)="activeTab = 'visits'" 
                        class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-150 text-base font-medium">
                  Créer Visite
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-md border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center">
              <div class="p-5 rounded-full bg-orange-100 text-orange-600">
                <span class="material-icons text-4xl">schedule</span>
              </div>
              <div class="ml-6 flex-1">
                <h4 class="text-xl font-semibold text-orange-900 mb-2">Expiration Visites</h4>
                <p class="text-base text-orange-700 mb-6">Déclencher manuellement l'expiration des visites</p>
                <button (click)="triggerExpirationCheck()" 
                        [disabled]="isExpiring"
                        class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 text-base font-medium relative">
                  <span *ngIf="!isExpiring" class="material-icons text-sm mr-2">schedule</span>
                  <span *ngIf="isExpiring" class="material-icons text-sm mr-2 animate-spin">refresh</span>
                  {{ isExpiring ? 'En cours...' : 'Expirer Visites' }}
                  <span *ngIf="visitsToExpireCount > 0 && !isExpiring" 
                        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {{ visitsToExpireCount }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visits')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <span class="material-icons text-4xl">event</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Visites Aujourd'hui</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.todayVisits }}</p>
              <p class="text-sm text-blue-600 mb-2">{{ stats.pendingVisits }} en attente</p>
              <p class="text-sm text-blue-500 mb-4">Total: {{ stats.todayVisits + stats.pendingVisits }}</p>
              <div class="flex items-center text-blue-600 text-base font-medium group-hover:text-blue-700">
                <span>Voir toutes</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visitors')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <span class="material-icons text-4xl">person</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-600 hover:text-green-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Visiteurs Actifs</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.activeVisitors }}</p>
              <p class="text-sm text-green-600 mb-4">+{{ stats.newVisitorsToday }} aujourd'hui</p>
              <div class="flex items-center text-green-600 text-base font-medium group-hover:text-green-700">
                <span>Voir tous</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('badges')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <span class="material-icons text-4xl">badge</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-600 hover:text-yellow-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Badges Imprimés & Générés</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">{{ getTotalBadges() }}</p>
              <p class="text-sm text-yellow-600 mb-1">{{ getPrintedBadges() }} imprimés</p>
              <p class="text-sm text-blue-600 mb-2">{{ getGeneratedBadges() }} générés</p>
              <div class="border-t border-gray-200 pt-2 mt-2">
                <p class="text-sm font-medium text-orange-600 mb-1">À Imprimer</p>
                <p class="text-2xl font-bold text-orange-600">{{ stats.badgesToPrint }}</p>
                <p class="text-xs text-red-600" *ngIf="stats.urgentBadges > 0">{{ stats.urgentBadges }} urgent</p>
              </div>
              <div class="flex items-center text-yellow-600 text-base font-medium group-hover:text-yellow-700 mt-2">
                <span>Voir tous</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visits')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <span class="material-icons text-4xl">exit_to_app</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-600 hover:text-purple-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Check-outs En Attente</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.pendingCheckouts }}</p>
              <p class="text-sm text-purple-600 mb-4" *ngIf="stats.pendingCheckouts > 0">À traiter</p>
              <div class="flex items-center text-purple-600 text-base font-medium group-hover:text-purple-700">
                <span>Voir toutes</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scanner QR Code -->
        <div class="mb-8">
          <app-qr-scanner></app-qr-scanner>
        </div>

        <!-- Statistiques des scans -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-badge-scan-stats></app-badge-scan-stats>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div class="space-y-3">
              <button (click)="setActiveTab('qr-scanner')" class="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <span class="material-icons text-blue-600 mr-3">qr_code_scanner</span>
                  <span class="text-blue-800 font-medium">Scanner un badge</span>
                </div>
                <span class="material-icons text-blue-600">arrow_forward</span>
              </button>
              <button (click)="setActiveTab('visits')" class="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <span class="material-icons text-green-600 mr-3">event</span>
                  <span class="text-green-800 font-medium">Gérer les visites</span>
                </div>
                <span class="material-icons text-green-600">arrow_forward</span>
              </button>
              <button (click)="setActiveTab('badges')" class="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <span class="material-icons text-purple-600 mr-3">print</span>
                  <span class="text-purple-800 font-medium">Imprimer des badges</span>
                </div>
                <span class="material-icons text-purple-600">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Visites récentes -->
        <div class="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md border border-blue-200 overflow-hidden">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-blue-900">Visites Récentes</h3>
          </div>
          <div class="space-y-3" *ngIf="stats.recentVisits && stats.recentVisits.length > 0; else noRecentVisits">
            <div *ngFor="let visit of stats.recentVisits" class="flex items-center justify-between py-3 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">{{ getInitials(visit.visitorName) }}</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ visit.visitorName }}</p>
                  <p class="text-xs text-gray-500">{{ visit.employeeName }} - {{ visit.departmentName }}</p>
                  <p class="text-xs text-blue-600">Début: {{ formatTime(visit.startTime) }}</p>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full" [ngClass]="getStatusClass(visit.status)">
                {{ getStatusLabel(visit.status) }}
              </span>
            </div>
          </div>
          <ng-template #noRecentVisits>
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-2xl text-blue-600">event_available</span>
              </div>
              <p class="text-gray-600">Aucune visite récente</p>
              <p class="text-sm text-gray-500">Les nouvelles visites apparaîtront ici</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Visites -->
      <div *ngIf="activeTab === 'visits'" class="min-h-full">
        <app-visit-list></app-visit-list>
      </div>

      <!-- Visiteurs -->
      <div *ngIf="activeTab === 'visitors'" class="min-h-full">
        <app-visitor-list></app-visitor-list>
      </div>

          <!-- Badges -->
          <div *ngIf="activeTab === 'badges'" class="min-h-full">
            <app-badge-list></app-badge-list>
          </div>

          <!-- Scanner QR -->
          <div *ngIf="activeTab === 'qr-scanner'" class="min-h-full">
            <app-qr-scanner></app-qr-scanner>
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
export class ReceptionDashboardComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  private navigationSubscription: Subscription = new Subscription();
  private welcomeShown = false;
  
  stats: ReceptionStats = {
    todayVisits: 0,
    pendingVisits: 0,
    activeVisitors: 0,
    newVisitorsToday: 0,
    badgesToPrint: 0,
    urgentBadges: 0,
    pendingCheckouts: 0,
    recentVisits: []
  };
  isExpiring = false;
  visitsToExpireCount = 0;
  badges: any[] = [];
  

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private toastService: ToastService,
    private apiService: ApiService,
    private dashboardUpdateService: DashboardUpdateService,
    private visitExpirationService: VisitExpirationService,
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

    // Écouter les mises à jour du dashboard
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
      }
    });

    // Charger les données du dashboard
    this.loadDashboardData();

    // Charger le nombre de visites à expirer
    this.loadVisitsToExpireCount();

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

  // Méthode publique pour recharger les données du dashboard
  reloadDashboardData(): void {
    this.loadDashboardData();
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

  private loadDashboardData(): void {
    // Charger les visites d'aujourd'hui
    this.apiService.getVisites().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const isSameLocalDay = (d1: Date, d2: Date) => (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
          );

          // Visites d'aujourd'hui (terminées/expirées avec badges fermés)
          const todayVisits = response.data.data.filter((visit: any) => {
            if (!visit?.dateDebut) return false;
            const startedToday = isSameLocalDay(new Date(visit.dateDebut), today);
            const isCompleted = visit?.statut === 'TERMINEE' || visit?.statut === 'EXPIREE';
            const isClosedBadge = visit?.badge?.status === 'CLOSED';
            return isCompleted && isClosedBadge && startedToday;
          });
          
          // Visites en cours (pour les visites récentes et checkouts en attente)
          const activeVisits = response.data.data.filter((visit: any) => 
            visit?.statut === 'EN_COURS'
          );
          
          // Visites planifiées (en attente)
          const pendingVisits = response.data.data.filter((visit: any) => 
            visit?.statut === 'PLANIFIEE'
          );
          
          this.stats.todayVisits = todayVisits.length;
          this.stats.pendingVisits = pendingVisits.length;
          this.stats.pendingCheckouts = activeVisits.length; // Visites en cours = checkouts en attente
          
          // Prendre les visites en cours pour les visites récentes (comme le dashboard admin)
          this.stats.recentVisits = activeVisits
            .sort((a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
            .slice(0, 5)
            .map((visit: any) => ({
              visitorName: `${visit.visiteur?.prenom || ''} ${visit.visiteur?.nom || ''}`,
              employeeName: `${visit.employe?.prenom || ''} ${visit.employe?.nom || ''}`,
              departmentName: visit.employe?.department?.nom || 'Non assigné',
              startTime: visit.dateDebut,
              status: visit.statut
            }));
          
        }
      },
      error: (error) => {
        // Erreur lors du chargement des visites
      }
    });

    // Charger les visiteurs actifs
    this.apiService.getVisiteurs().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          this.stats.activeVisitors = response.data.data.length;
          
          // Compter les nouveaux visiteurs d'aujourd'hui
          const newVisitorsToday = response.data.data.filter((visitor: any) => {
            const visitorDate = new Date(visitor.createdAt);
            visitorDate.setHours(0, 0, 0, 0);
            return visitorDate.getTime() === today.getTime();
          });
          
          this.stats.newVisitorsToday = newVisitorsToday.length;
        }
      },
      error: (error) => {
        // Erreur lors du chargement des visiteurs
      }
    });

    // Charger les badges
    this.apiService.getBadges({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.badges = response.data.data;
          
          // Compter les badges GENERATED (à imprimer) ET qui ont un visiteur et un employé assignés
          this.stats.badgesToPrint = response.data.data.filter((badge: any) => 
            badge.status === 'GENERATED' &&
            badge.visite?.visiteur && badge.visite?.employe
          ).length;

          // Compter les badges urgents (générés depuis plus de 30 minutes)
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
          this.stats.urgentBadges = response.data.data.filter((badge: any) => 
            badge.status === 'GENERATED' &&
            badge.visite?.visiteur && badge.visite?.employe &&
            new Date(badge.createdAt) < thirtyMinutesAgo
          ).length;
        }
      },
      error: (error) => {
        // Erreur lors du chargement des badges
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
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
      case 'PLANIFIEE':
        return 'text-yellow-600 bg-yellow-100';
      case 'EN_COURS':
        return 'text-green-600 bg-green-100';
      case 'TERMINEE':
        return 'text-gray-600 bg-gray-100';
      case 'EXPIREE':
        return 'text-orange-600 bg-orange-100';
      case 'ANNULEE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PLANIFIEE':
        return 'Planifiée';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'EXPIREE':
        return 'Expirée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return 'Inconnu';
    }
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

  // Charger les départements
}



