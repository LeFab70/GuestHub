import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeScanStatsApiService, BadgeScanRecord, ScanStats } from '../../services/badge-scan-stats-api.service';
import { DashboardUpdateService } from '../../services/dashboard-update.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-badge-scan-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Statistiques des scans</h3>
        <div class="flex items-center space-x-2">
          <span class="material-icons text-gray-400">qr_code_scanner</span>
          <span class="text-sm text-gray-500">Aujourd'hui</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Total scans aujourd'hui -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="material-icons text-blue-600">qr_code</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-blue-900">Total scans</p>
              <p class="text-2xl font-bold text-blue-600">{{ stats.totalToday }}</p>
            </div>
          </div>
        </div>

        <!-- Scans récents (24h) -->
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="material-icons text-green-600">schedule</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-900">Dernières 24h</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.totalRecent }}</p>
            </div>
          </div>
        </div>

        <!-- Dernier scan -->
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="material-icons text-purple-600">access_time</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-purple-900">Dernier scan</p>
              <p class="text-sm font-bold text-purple-600">
                {{ stats.lastScanTime ? (stats.lastScanTime | date:'HH:mm') : 'Aucun' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Répartition par action -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Répartition des actions</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="material-icons text-blue-600 text-sm mr-2">search</span>
              <span class="text-sm text-gray-700">Scans</span>
            </div>
            <span class="text-lg font-semibold text-blue-600">
              {{ stats.scansByAction['scan'] || 0 }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="material-icons text-red-600 text-sm mr-2">logout</span>
              <span class="text-sm text-gray-700">Check-outs</span>
            </div>
            <span class="text-lg font-semibold text-red-600">
              {{ stats.scansByAction['check-out'] || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Historique récent -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">{{ showOnlyCheckouts ? 'Check-outs récents' : 'Scans récents' }}</h4>
        <div class="space-y-2 max-h-48 overflow-y-auto" *ngIf="recentScans.length > 0; else noScans">
          <div *ngFor="let scan of recentScans" class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <div class="flex items-center space-x-2">
              <span class="material-icons text-sm" 
                    [class]="scan.action === 'check-out' ? 'text-red-600' : 'text-blue-600'">
                {{ scan.action === 'check-out' ? 'logout' : 'qr_code' }}
              </span>
              <span class="font-mono text-gray-700">{{ scan.qrCode }}</span>
              <span *ngIf="scan.visitorName" class="text-gray-500">- {{ scan.visitorName }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 text-xs rounded-full" 
                    [class]="scan.action === 'check-out' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                {{ scan.action === 'check-out' ? 'Check-out' : 'Scan' }}
              </span>
              <span class="text-xs text-gray-500">{{ scan.createdAt | date:'dd/MM HH:mm' }}</span>
            </div>
          </div>
        </div>
        <ng-template #noScans>
          <div class="text-center py-4">
            <span class="material-icons text-gray-300 text-4xl">{{ showOnlyCheckouts ? 'logout' : 'qr_code_scanner' }}</span>
            <p class="text-sm text-gray-500 mt-2">{{ showOnlyCheckouts ? "Aucun check-out aujourd'hui" : "Aucun scan aujourd'hui" }}</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class BadgeScanStatsComponent implements OnInit, OnDestroy {
  @Input() showOnlyCheckouts: boolean = true; // Par défaut, ne montrer que les check-outs
  
  stats: ScanStats = {
    totalToday: 0,
    totalRecent: 0,
    scansByAction: {},
    lastScanTime: undefined
  };
  recentScans: BadgeScanRecord[] = [];
  private subscription?: Subscription;
  private refreshInterval?: Subscription;

  constructor(
    private badgeScanStatsApiService: BadgeScanStatsApiService,
    private dashboardUpdateService: DashboardUpdateService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadRecentScans();
    
    // Écouter les mises à jour du dashboard
    this.subscription = this.dashboardUpdateService.dashboardUpdate$.subscribe(() => {
      this.loadStats();
      this.loadRecentScans();
    });
    
    // Rafraîchir les données toutes les 30 secondes
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadStats();
      this.loadRecentScans();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  private loadStats() {
    this.badgeScanStatsApiService.getScanStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading scan stats:', error);
      }
    });
  }

  private loadRecentScans() {
    this.badgeScanStatsApiService.getRecentScans(50).subscribe({
      next: (response) => {
        if (response.success) {
          const scans: BadgeScanRecord[] = response.data;

          // Ne garder que les scans du jour courant
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          const todaysScans = scans.filter((scan: any) => {
            const created = new Date(scan.createdAt);
            return created >= startOfDay;
          });

          // Optionnel: ne garder que les check-out
          if (this.showOnlyCheckouts) {
            this.recentScans = todaysScans.filter((scan: any) => scan.action === 'check-out');
          } else {
            this.recentScans = todaysScans;
          }
        }
      },
      error: (error) => {
        console.error('Error loading recent scans:', error);
      }
    });
  }
}
