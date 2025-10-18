import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { BadgeScanStatsApiService } from '../../services/badge-scan-stats-api.service';
import { Badge, BadgeStatus, Visite } from '../../models/user.model';
import { DashboardUpdateService } from '../../services/dashboard-update.service';
import { NotificationService } from '../../services/notification.service';
import { BadgePrintComponent, BadgeData } from './badge-print.component';
import { PaginationComponent } from '../shared/pagination.component';

@Component({
  selector: 'app-badge-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgePrintComponent, PaginationComponent],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Badges</h2>
        <div class="text-sm text-gray-600">
          {{ getBadgeCount(BadgeStatus.GENERATED) }} badges en attente d'impression
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterBadges()" 
                   placeholder="QR Code, visiteur..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">État</label>
            <select [(ngModel)]="etatFilter" (change)="filterBadges()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous</option>
              <option value="GENERATED">Généré</option>
              <option value="PRINTED">Imprimé</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des badges -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiteur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Visite</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Impression</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let badge of paginatedBadges">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ badge.qrCode }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="badge.visite?.visiteur?.nom && badge.visite?.visiteur?.prenom; else fallbackVisitor">
                  <div class="font-medium text-gray-900">{{ badge.visite?.visiteur?.prenom }} {{ badge.visite?.visiteur?.nom }}</div>
                  <div class="text-xs text-gray-500" *ngIf="badge.visite?.visiteur?.entreprise">
                    {{ badge.visite?.visiteur?.entreprise }}
                  </div>
                  <div class="text-xs text-blue-600" *ngIf="badge.visite?.visiteur?.email">
                    {{ badge.visite?.visiteur?.email }}
                  </div>
                </div>
                <ng-template #fallbackVisitor>
                  <span class="text-gray-400">Non assigné</span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="badge.visite?.employe?.nom && badge.visite?.employe?.prenom; else fallbackEmployee">
                  {{ badge.visite?.employe?.prenom }} {{ badge.visite?.employe?.nom }}
                </div>
                <ng-template #fallbackEmployee>
                  <span class="text-gray-400">Non assigné</span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="badge.visite?.employe?.department?.nom; else fallbackDept">
                  {{ badge.visite?.employe?.department?.nom }}
                </div>
                <ng-template #fallbackDept>
                  <span class="text-gray-400">Non assigné</span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="badge.visite?.dateDebut; else noVisitDate">
                  <div class="font-medium text-gray-900">{{ badge.visite?.dateDebut | date:'dd/MM/yyyy' }}</div>
                  <div class="text-xs text-gray-500">{{ badge.visite?.dateDebut | date:'HH:mm' }}</div>
                </div>
                <ng-template #noVisitDate>
                  <span class="text-gray-400">Non définie</span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="badge.dateImpression; else noDate">
                  {{ badge.dateImpression | date:'dd/MM/yyyy HH:mm' }}
                </div>
                <ng-template #noDate>
                  <span class="text-gray-400">Non imprimé</span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getEtatClass(badge.status)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getEtatLabel(badge.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="previewBadge(badge)" 
                        *ngIf="badge.status === BadgeStatus.GENERATED"
                        class="text-blue-600 hover:text-blue-900 mr-2" 
                        title="Aperçu et impression du badge">
                  <span class="material-icons text-sm">print</span>
                </button>
                <button (click)="returnBadge(badge)" 
                        *ngIf="badge.status === BadgeStatus.PRINTED"
                        class="text-orange-600 hover:text-orange-900 mr-2" 
                        title="Marquer comme rendu">
                  <span class="material-icons text-sm">assignment_return</span>
                </button>
                <button (click)="viewBadge(badge)" 
                        class="text-gray-600 hover:text-gray-900" 
                        title="Voir les détails">
                  <span class="material-icons text-sm">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <!-- Pagination -->
      <app-pagination 
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [totalItems]="filteredBadges.length"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)">
      </app-pagination>

      <!-- Statistiques des badges -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Badges</h3>
          <p class="text-2xl font-bold text-gray-900">{{ badges.length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">À Imprimer</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ getBadgeCount(BadgeStatus.GENERATED) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Imprimés</h3>
          <p class="text-2xl font-bold text-blue-600">{{ getBadgeCount(BadgeStatus.PRINTED) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Fermés</h3>
          <p class="text-2xl font-bold text-green-600">{{ getBadgeCount(BadgeStatus.CLOSED) }}</p>
        </div>
      </div>

      <!-- Modal d'aperçu -->
      <div *ngIf="showPreviewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Aperçu du Badge</h3>
              <button 
                (click)="closePreview()"
                class="text-gray-400 hover:text-gray-600">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div *ngIf="selectedBadge" class="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <!-- En-tête du badge -->
              <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">BADGE VISITEUR</h2>
                <div class="w-16 h-1 bg-blue-600 mx-auto"></div>
              </div>
              
              <!-- Informations du visiteur -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="text-sm font-medium text-gray-600">Visiteur</label>
                  <p class="text-lg font-semibold text-gray-800">
                    {{ selectedBadge.visite?.visiteur?.prenom }} {{ selectedBadge.visite?.visiteur?.nom }}
                  </p>
                  <p class="text-sm text-gray-600" *ngIf="selectedBadge.visite?.visiteur?.entreprise">
                    {{ selectedBadge.visite?.visiteur?.entreprise }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Employé</label>
                  <p class="text-lg font-semibold text-gray-800">
                    {{ selectedBadge.visite?.employe?.prenom }} {{ selectedBadge.visite?.employe?.nom }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Département</label>
                  <p class="text-lg font-semibold text-gray-800">{{ selectedBadge.visite?.employe?.department?.nom }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Motif</label>
                  <p class="text-lg font-semibold text-gray-800">{{ selectedBadge.visite?.motif || 'Visite' }}</p>
                </div>
              </div>
              
              <!-- QR Code -->
              <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gray-100 rounded-lg">
                  <div class="text-2xl font-mono font-bold text-gray-800 mb-2">{{ selectedBadge.qrCode }}</div>
                  <div class="w-32 h-32 bg-white border-2 border-gray-300 mx-auto flex items-center justify-center">
                    <span class="text-xs text-gray-500">QR CODE</span>
                  </div>
                </div>
              </div>
              
              <!-- Dates -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="text-sm font-medium text-gray-600">Date de début</label>
                  <p class="text-lg font-semibold text-gray-800">
                    {{ selectedBadge.visite?.dateDebut | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Date de fin</label>
                  <p class="text-lg font-semibold text-gray-800">
                    {{ selectedBadge.visite?.dateFin | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
              </div>
              
              <!-- Instructions -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-yellow-800 mb-2">Instructions :</h4>
                <ul class="text-sm text-yellow-700 space-y-1">
                  <li>• Portez ce badge visiblement pendant votre visite</li>
                  <li>• Rendez-le à la réception en partant</li>
                  <li>• Ne le prêtez à personne d'autre</li>
                </ul>
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex justify-end space-x-3 mt-6">
              <button 
                (click)="closePreview()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                Annuler
              </button>
              <button 
                (click)="confirmPrint()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                Imprimer le Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'impression -->
      <div *ngIf="showPrintModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Impression de Badge</h3>
              <button 
                (click)="showPrintModal = false"
                class="text-gray-400 hover:text-gray-600">
                <span class="material-icons">close</span>
              </button>
            </div>
            <app-badge-print [badgeData]="selectedBadgeData"></app-badge-print>
          </div>
        </div>
      </div>

      <!-- Modal des détails du badge -->
      <div *ngIf="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Détails du Badge</h3>
              <button 
                (click)="closeDetailsModal()"
                class="text-gray-400 hover:text-gray-600 transition-colors">
                <span class="material-icons text-2xl">close</span>
              </button>
            </div>
            
            <div *ngIf="selectedBadge" class="space-y-6">
              <!-- QR Code -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">QR Code</h4>
                <div class="font-mono text-lg text-gray-900 bg-white p-3 rounded border">
                  {{ selectedBadge.qrCode }}
                </div>
              </div>

              <!-- Informations du visiteur -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-blue-700 mb-2">Visiteur</h4>
                  <div class="text-lg font-semibold text-blue-900">
                    {{ selectedBadge.visite?.visiteur?.prenom }} {{ selectedBadge.visite?.visiteur?.nom }}
                  </div>
                  <div class="text-sm text-blue-600" *ngIf="selectedBadge.visite?.visiteur?.entreprise">
                    {{ selectedBadge.visite?.visiteur?.entreprise }}
                  </div>
                </div>

                <div class="bg-green-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-green-700 mb-2">Employé</h4>
                  <div class="text-lg font-semibold text-green-900">
                    {{ selectedBadge.visite?.employe?.prenom }} {{ selectedBadge.visite?.employe?.nom }}
                  </div>
                  <div class="text-sm text-green-600" *ngIf="selectedBadge.visite?.employe?.poste">
                    {{ selectedBadge.visite?.employe?.poste }}
                  </div>
                </div>
              </div>

              <!-- Département et motif -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-purple-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-purple-700 mb-2">Département</h4>
                  <div class="text-lg font-semibold text-purple-900">
                    {{ selectedBadge.visite?.employe?.department?.nom || 'Non assigné' }}
                  </div>
                </div>

                <div class="bg-orange-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-orange-700 mb-2">Motif de visite</h4>
                  <div class="text-lg font-semibold text-orange-900">
                    {{ selectedBadge.visite?.motif || 'Non spécifié' }}
                  </div>
                </div>
              </div>

              <!-- Dates et statut -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Date d'impression</h4>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ selectedBadge.dateImpression ? (selectedBadge.dateImpression | date:'dd/MM/yyyy HH:mm') : 'Non imprimé' }}
                  </div>
                </div>

                <div class="bg-indigo-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-indigo-700 mb-2">Statut</h4>
                  <span [class]="getEtatClass(selectedBadge.status)" 
                        class="px-3 py-1 inline-flex text-sm font-semibold rounded-full">
                    {{ getEtatLabel(selectedBadge.status) }}
                  </span>
                </div>
              </div>

              <!-- Informations de la visite -->
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-yellow-700 mb-3">Informations de la visite</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm text-yellow-600">Date de début:</span>
                    <div class="font-semibold text-yellow-900">
                      {{ selectedBadge.visite?.dateDebut | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                  </div>
                  <div>
                    <span class="text-sm text-yellow-600">Date de fin:</span>
                    <div class="font-semibold text-yellow-900">
                      {{ selectedBadge.visite?.dateFin | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                  </div>
                </div>
                <div class="mt-2">
                  <span class="text-sm text-yellow-600">Statut de la visite:</span>
                  <span [class]="getStatusClass(selectedBadge.visite?.statut)" 
                        class="ml-2 px-2 py-1 inline-flex text-xs font-semibold rounded-full">
                    {{ selectedBadge.visite?.statut }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button 
                (click)="closeDetailsModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BadgeListComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private badgeScanStatsApiService = inject(BadgeScanStatsApiService);
  private dashboardUpdateService = inject(DashboardUpdateService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  private subscriptions: Subscription[] = [];
  
  badges: Badge[] = [];
  filteredBadges: Badge[] = [];
  paginatedBadges: Badge[] = [];
  searchTerm = '';
  etatFilter = 'GENERATED'; // Par défaut sur "Généré"
  BadgeStatus = BadgeStatus;
  showPrintModal = false;
  showPreviewModal = false;
  showDetailsModal = false;
  selectedBadge: Badge | null = null;
  selectedBadgeData: BadgeData = {
    id: '',
    visitorName: '',
    startDate: new Date(),
    endDate: new Date(),
    employeeName: '',
    departmentName: '',
    qrCode: '',
    visitPurpose: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit() {
    this.loadBadges();

    // Écouter les mises à jour du dashboard
    this.subscriptions.push(
      this.dashboardUpdateService.dashboardUpdate$.subscribe(() => {
        this.loadBadges();
      })
    );

    // Rafraîchissement automatique toutes les 15 secondes
    this.subscriptions.push(
      interval(60000).subscribe(() => {
        this.refreshBadges();
      })
    );

    // Vérifier s'il y a un paramètre de prévisualisation dans l'URL
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['preview']) {
          const qrCode = params['preview'];
          // Attendre que les badges soient chargés
          if (this.badges.length > 0) {
            const badge = this.badges.find(b => b.qrCode === qrCode);
            if (badge) {
              this.previewBadge(badge);
              // Nettoyer l'URL
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {}
              });
            }
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBadges() {
    // Charger une grande page pour éviter de rater des badges dans les compteurs
    this.apiService.getBadges({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.badges = response.data.data;
          this.filterBadges();

          // Vérifier s'il y a un paramètre de prévisualisation après le chargement
          this.checkForPreviewParam();
        } else {
          this.badges = [];
          this.filteredBadges = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des badges:', error);
        this.badges = [];
        this.filteredBadges = [];
      }
    });
  }

  // Rafraîchissement rapide des badges
  refreshBadges() {
    this.loadBadges();
  }

  private checkForPreviewParam(): void {
    const params = this.route.snapshot.queryParams;
    if (params['preview']) {
      const qrCode = params['preview'];
      const badge = this.badges.find(b => b.qrCode === qrCode);
      if (badge) {
        // Attendre un peu pour que la vue soit stable
        setTimeout(() => {
          this.previewBadge(badge);
          // Nettoyer l'URL après ouverture
          setTimeout(() => {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {}
            });
          }, 500);
        }, 100);
      }
    }
  }

  filterBadges() {
    this.filteredBadges = this.badges.filter(badge => {
      const matchesSearch = !this.searchTerm || 
        badge.qrCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        badge.visiteId.toString().includes(this.searchTerm) ||
        badge.visite?.visiteur?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        badge.visite?.visiteur?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        badge.visite?.employe?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        badge.visite?.employe?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEtat = !this.etatFilter || badge.status === this.etatFilter;

      return matchesSearch && matchesEtat;
    });
    
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredBadges.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePaginatedBadges();
  }

  updatePaginatedBadges() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedBadges = this.filteredBadges.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedBadges();
  }

  clearFilters() {
    this.searchTerm = '';
    this.etatFilter = 'GENERATED';
    this.currentPage = 1;
    this.filterBadges();
  }

  getEtatClass(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.GENERATED: return 'bg-gray-100 text-gray-800';
      case BadgeStatus.PRINTED: return 'bg-blue-100 text-blue-800';
      case BadgeStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getEtatLabel(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.GENERATED: return 'Généré';
      case BadgeStatus.PRINTED: return 'Imprimé';
      case BadgeStatus.CLOSED: return 'Fermé';
      default: return status;
    }
  }

  getBadgeCount(status: BadgeStatus): number {
    return this.badges.filter(badge => badge.status === status).length;
  }

  previewBadge(badge: Badge) {
    this.selectedBadge = badge;
    this.showPreviewModal = true;
  }

  closePreview() {
    this.showPreviewModal = false;
    this.selectedBadge = null;
  }

  confirmPrint() {
    if (this.selectedBadge) {
      this.apiService.printBadge(this.selectedBadge.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Pré-remplir les données du badge pour l'impression
            this.selectedBadgeData = {
              id: this.selectedBadge!.id.toString(),
              visitorName: `${this.selectedBadge!.visite?.visiteur?.prenom || ''} ${this.selectedBadge!.visite?.visiteur?.nom || ''}`.trim() || 'Visiteur non assigné',
              startDate: this.selectedBadge!.visite?.dateDebut ? new Date(this.selectedBadge!.visite.dateDebut) : new Date(),
              endDate: this.selectedBadge!.visite?.dateFin ? new Date(this.selectedBadge!.visite.dateFin) : new Date(Date.now() + 2 * 60 * 60 * 1000),
              employeeName: `${this.selectedBadge!.visite?.employe?.prenom || ''} ${this.selectedBadge!.visite?.employe?.nom || ''}`.trim() || 'Employé non assigné',
              departmentName: this.selectedBadge!.visite?.employe?.department?.nom || 'Département non assigné',
              qrCode: this.selectedBadge!.qrCode,
              visitPurpose: this.selectedBadge!.visite?.motif || 'Visite'
            };
            this.showPreviewModal = false;
            this.showPrintModal = true;
            this.loadBadges(); // Recharger la liste pour mettre à jour l'état
            this.dashboardUpdateService.triggerDashboardUpdate(); // Notifier le dashboard
            
            // Supprimer les notifications liées à ce badge
            this.removeNotificationsForBadge(this.selectedBadge!.qrCode);
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'impression du badge:', error);
          alert('Erreur lors de l\'impression du badge: ' + (error.error?.message || error.message));
        }
      });
    }
  }


  returnBadge(badge: Badge) {
    if (!confirm(`Confirmer la fin de visite pour ${badge.visite?.visiteur?.prenom} ${badge.visite?.visiteur?.nom} ?`)) {
      return;
    }

    this.apiService.returnBadge(badge.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Enregistrer un scan de badge pour la fin de visite
          this.recordBadgeScan(badge.qrCode, 'check-out', badge.visite);
          
          // Afficher une notification de succès
          this.notificationService.addNotification({
            type: 'visit_completed',
            title: 'Visite terminée',
            message: `La visite de ${badge.visite?.visiteur?.prenom} ${badge.visite?.visiteur?.nom} a été terminée avec succès`,
            count: 1,
            actionUrl: '/badges',
            data: {
              badgeId: badge.qrCode,
              visitorName: `${badge.visite?.visiteur?.prenom} ${badge.visite?.visiteur?.nom}`,
              employeeName: `${badge.visite?.employe?.prenom} ${badge.visite?.employe?.nom}`,
              departmentName: badge.visite?.employe?.department?.nom
            }
          });
          
          // Recharger la liste pour mettre à jour l'état
          this.loadBadges();
          // Notifier le dashboard
          this.dashboardUpdateService.triggerDashboardUpdate();
        }
      },
      error: (error) => {
        console.error('Erreur lors du retour du badge:', error);
        alert('Erreur lors du retour du badge: ' + (error.error?.message || error.message));
      }
    });
  }

  viewBadge(badge: Badge) {
    this.selectedBadge = badge;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBadge = null;
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'EN_COURS': return 'bg-green-100 text-green-800';
      case 'TERMINEE': return 'bg-gray-100 text-gray-800';
      case 'PLANIFIEE': return 'bg-blue-100 text-blue-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  private removeNotificationsForBadge(qrCode: string): void {
    // Récupérer toutes les notifications
    const notifications = this.notificationService.getNotifications();
    
    // Trouver les notifications liées à ce badge
    const notificationsToRemove = notifications.filter((notification: any) => 
      notification.type === 'visit_created' && 
      notification.data?.badgeId === qrCode
    );
    
    // Supprimer ces notifications
    notificationsToRemove.forEach((notification: any) => {
      this.notificationService.removeNotification(notification.id);
    });
  }

  // Enregistrer un scan de badge
  private recordBadgeScan(qrCode: string, action: string, visit: any) {
    // Enregistrer le scan avec toutes les informations nécessaires
    const scanData = {
      qrCode: qrCode,
      action: action as 'scan' | 'check-out',
      visitorName: visit?.visiteur ? `${visit.visiteur.prenom} ${visit.visiteur.nom}` : undefined,
      employeeName: visit?.employe ? `${visit.employe.prenom} ${visit.employe.nom}` : undefined,
      departmentName: visit?.employe?.department?.nom,
      visitId: visit?.id,
      badgeId: visit?.badge?.id
    };

    this.badgeScanStatsApiService.addScanRecord(scanData).subscribe({
      next: () => {
        console.log('Scan de badge enregistré avec succès:', action, qrCode);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'enregistrement du scan:', error);
        // Ne pas utiliser le fallback pour éviter les doublons
        // Le scan sera quand même enregistré via l'API scanBadge si nécessaire
      }
    });
  }
}
