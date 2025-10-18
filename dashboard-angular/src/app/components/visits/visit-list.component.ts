import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DashboardUpdateService } from '../../services/dashboard-update.service';
import { ToastService } from '../../services/toast.service';
import { BadgePreviewModalComponent } from '../badges/badge-preview-modal.component';
import { BadgePreviewService } from '../../services/badge-preview.service';
import { BadgeScanStatsApiService } from '../../services/badge-scan-stats-api.service';
import { Visite, Visiteur, Employe, Badge, BadgeStatus } from '../../models/user.model';
import { PaginationComponent } from '../shared/pagination.component';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, BadgePreviewModalComponent],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Visites</h2>
        <button 
          (click)="openCreateModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Nouvelle Visite
        </button>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterVisits()" 
                   placeholder="Visiteur, entreprise, motif..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Statut</label>
            <select [(ngModel)]="statusFilter" (change)="filterVisits()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Toutes les visites</option>
              <option value="PLANIFIEE">Planifiée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="EXPIREE">Expirée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Département</label>
            <select [(ngModel)]="departmentFilter" (change)="filterVisits()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous</option>
              <option *ngFor="let dept of departments" [value]="dept.nom">{{ dept.nom }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date Début</label>
            <input [(ngModel)]="dateFromFilter" (change)="filterVisits()" type="date"
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date Fin</label>
            <input [(ngModel)]="dateToFilter" (change)="filterVisits()" type="date"
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des visites -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiteur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Entrée</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sortie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let visit of paginatedVisits">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div>{{ visit.visiteur?.prenom }} {{ visit.visiteur?.nom }}</div>
                <div class="text-xs text-gray-500">{{ visit.visiteur?.entreprise || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ visit.employe?.prenom }} {{ visit.employe?.nom }}</div>
                <div class="text-xs text-gray-500">{{ visit.employe?.department?.nom || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ visit.dateDebut | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div *ngIf="(visit.statut === 'TERMINEE' || visit.statut === 'EXPIREE') && visit.dateFin; else noExitDate">
                  {{ visit.dateFin | date:'dd/MM/yyyy HH:mm' }}
                </div>
                <ng-template #noExitDate>
                  <span class="text-gray-400 italic">
                    {{ getStatusLabel(visit.statut) }}
                  </span>
                </ng-template>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ visit.motif }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusClass(visit.statut)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusLabel(visit.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div *ngIf="visit.badge; else noBadge">
                  <div class="flex items-center space-x-2">
                    <button *ngIf="visit.badge.status === 'GENERATED' || visit.statut === 'EN_COURS'; else nonClickableQrCode" 
                            (click)="handleBadgeClick(visit)" 
                            [class]="getBadgeButtonClass(visit)"
                            [title]="getBadgeButtonTitle(visit)">
                      {{ visit.badge.qrCode }}
                    </button>
                    <ng-template #nonClickableQrCode>
                      <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {{ visit.badge.qrCode }}
                      </span>
                    </ng-template>
                    <span [class]="getBadgeClass(visit.badge.status)" 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getBadgeStatusLabel(visit.badge.status) }}
                    </span>
                  </div>
                </div>
                <ng-template #noBadge>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500">
                    Aucun badge
                  </span>
                </ng-template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editVisit(visit)" 
                        class="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors" 
                        title="Modifier la visite">
                  <span class="material-icons text-sm">edit</span>
                </button>
                <button (click)="checkoutVisit(visit)" *ngIf="visit.statut === 'EN_COURS'" 
                        class="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors" 
                        title="Check-out de la visite">
                  <span class="material-icons text-sm">exit_to_app</span>
                </button>
                <button (click)="deleteVisit(visit.id)" 
                        class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors" 
                        title="Supprimer la visite">
                  <span class="material-icons text-sm">delete</span>
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
        [totalItems]="filteredVisits.length"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)">
      </app-pagination>

      <!-- Modal de création/édition -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingVisit ? 'Modifier la visite' : 'Nouvelle visite' }}
            </h3>
            <form (ngSubmit)="saveVisit()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Visiteur</label>
                <select [(ngModel)]="visitForm.visiteurId" name="visiteurId" required
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Sélectionner un visiteur</option>
                  <option *ngFor="let visitor of visitors" [value]="visitor.id">
                    {{ visitor.prenom }} {{ visitor.nom }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Employé visité</label>
                <select [(ngModel)]="visitForm.employeId" name="employeId"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Sélectionner un employé</option>
                  <option *ngFor="let employee of employees" [value]="employee.id">
                    {{ employee.prenom }} {{ employee.nom }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Motif</label>
                <textarea [(ngModel)]="visitForm.motif" name="motif" rows="3" required
                          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date d'entrée</label>
                <input [ngModel]="getDateString(visitForm.dateDebut)" (ngModelChange)="setDate($event)" name="dateDebut" type="datetime-local" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Statut</label>
                <select [(ngModel)]="visitForm.statut" name="statut"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="PLANIFIEE">Planifiée</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINEE">Terminée</option>
                  <option value="EXPIREE">Expirée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
              </div>
              <div class="flex justify-end space-x-3">
                <button type="button" (click)="closeModal()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Annuler
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {{ editingVisit ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal d'aperçu du badge -->
      <app-badge-preview-modal 
        [showPreview]="showBadgePreview"
        (previewClosed)="closeBadgePreview()"
        (badgePrinted)="onBadgePrinted($event)">
      </app-badge-preview-modal>

      <!-- Modal de scan/check-out -->
      <div *ngIf="showScanModal && selectedVisitForScan" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Scan et Check-out</h3>
              <button 
                (click)="closeScanModal()"
                class="text-gray-400 hover:text-gray-600">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <!-- Informations de la visite -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Informations de la visite</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Visiteur:</strong> {{ selectedVisitForScan.visiteur?.prenom }} {{ selectedVisitForScan.visiteur?.nom }}</p>
                  <p><strong>Email:</strong> {{ selectedVisitForScan.visiteur?.email }}</p>
                  <p><strong>Entreprise:</strong> {{ selectedVisitForScan.visiteur?.entreprise }}</p>
                </div>
                <div>
                  <p><strong>Employé:</strong> {{ selectedVisitForScan.employe?.prenom }} {{ selectedVisitForScan.employe?.nom }}</p>
                  <p><strong>Département:</strong> {{ selectedVisitForScan.employe?.department?.nom }}</p>
                  <p><strong>Date début:</strong> {{ selectedVisitForScan.dateDebut | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-200">
                <p><strong>Motif:</strong> {{ selectedVisitForScan.motif }}</p>
                <p><strong>QR Code:</strong> <span class="font-mono text-blue-600">{{ selectedVisitForScan.badge?.qrCode }}</span></p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3">
              <button 
                (click)="closeScanModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                Annuler
              </button>
              <button 
                (click)="performCheckout(selectedVisitForScan)"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                <span class="material-icons text-sm mr-2">logout</span>
                Terminer la visite (Check-out)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VisitListComponent implements OnInit {
  visits: Visite[] = [];
  filteredVisits: Visite[] = [];
  paginatedVisits: Visite[] = [];
  visitors: Visiteur[] = [];
  employees: Employe[] = [];
  showModal = false;
  editingVisit: Visite | null = null;
  visitForm: Partial<Visite> = {};
  searchTerm = '';
  statusFilter = 'EN_COURS'; // Filtrer par défaut les visites en cours
  departmentFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  
  // Départements pour le filtre
  departments: any[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Badge preview
  showBadgePreview = false;
  
  // Scan modal
  showScanModal = false;
  selectedVisitForScan: Visite | null = null;

  constructor(
    private badgePreviewService: BadgePreviewService
  ) {
    // Initialiser paginatedVisits comme un tableau vide
    this.paginatedVisits = [];
    // Initialiser departments comme un tableau vide
    this.departments = [];
  }

  private apiService = inject(ApiService);
  private dashboardUpdateService = inject(DashboardUpdateService);
  private toastService = inject(ToastService);
  private badgeScanStatsApiService = inject(BadgeScanStatsApiService);

  ngOnInit() {
    this.loadVisits();
    this.loadVisitors();
    this.loadEmployees();
    this.loadDepartments();
    
    // Écouter les mises à jour du dashboard
    this.dashboardUpdateService.dashboardUpdate$.subscribe(() => {
      this.loadVisits();
    });
  }

  loadVisits() {
    this.apiService.getVisites().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.visits = response.data.data;
          this.filterVisits();
        } else {
          this.visits = [];
          this.filteredVisits = [];
          this.paginatedVisits = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des visites:', error);
        this.visits = [];
        this.filteredVisits = [];
        this.paginatedVisits = [];
      }
    });
  }

  loadVisitors() {
    this.apiService.getVisiteurs().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.visitors = response.data.data;
        } else {
          this.visitors = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des visiteurs:', error);
        this.visitors = [];
      }
    });
  }

  loadEmployees() {
    this.apiService.getEmployes().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.employees = response.data.data;
        } else {
          this.employees = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
        this.employees = [];
      }
    });
  }

  loadDepartments() {
    this.apiService.getDepartements().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.data) {
          this.departments = response.data.data;
        } else {
          this.departments = [];
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.departments = [];
      }
    });
  }

  filterVisits() {
    this.filteredVisits = this.visits.filter(visit => {
      const matchesSearch = !this.searchTerm || 
        visit.visiteur?.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visit.visiteur?.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visit.visiteur?.entreprise?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visit.motif.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || visit.statut === this.statusFilter;
      
      const matchesDepartment = !this.departmentFilter || 
        visit.employe?.department?.nom === this.departmentFilter;
      
      const matchesDateRange = this.matchesDateRange(visit);
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesDateRange;
    });
    
    this.updatePagination();
  }

  matchesDateRange(visit: Visite): boolean {
    if (!this.dateFromFilter && !this.dateToFilter) {
      return true;
    }

    const visitDate = new Date(visit.dateDebut);
    const fromDate = this.dateFromFilter ? new Date(this.dateFromFilter) : null;
    const toDate = this.dateToFilter ? new Date(this.dateToFilter) : null;

    // Si seulement date de début est spécifiée
    if (fromDate && !toDate) {
      return visitDate >= fromDate;
    }

    // Si seulement date de fin est spécifiée
    if (!fromDate && toDate) {
      toDate.setHours(23, 59, 59, 999); // Fin de journée
      return visitDate <= toDate;
    }

    // Si les deux dates sont spécifiées
    if (fromDate && toDate) {
      toDate.setHours(23, 59, 59, 999); // Fin de journée
      return visitDate >= fromDate && visitDate <= toDate;
    }

    return true;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  updatePagination() {
    if (!this.filteredVisits || !Array.isArray(this.filteredVisits)) {
      this.totalPages = 1;
      this.currentPage = 1;
      this.paginatedVisits = [];
      return;
    }
    this.totalPages = Math.ceil(this.filteredVisits.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePaginatedVisits();
  }

  updatePaginatedVisits() {
    if (!this.filteredVisits || !Array.isArray(this.filteredVisits)) {
      this.paginatedVisits = [];
      return;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedVisits = this.filteredVisits.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedVisits();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.departmentFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.currentPage = 1;
    this.filterVisits();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PLANIFIEE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'EXPIREE': return 'bg-orange-100 text-orange-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'EXPIREE': return 'Expirée';
      case 'ANNULEE': return 'Annulée';
      default: return status;
    }
  }

  getBadgeClass(status?: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.PRINTED: return 'bg-blue-100 text-blue-800';
      case BadgeStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      case BadgeStatus.GENERATED: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getBadgeStatusLabel(status?: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.GENERATED: return 'Généré';
      case BadgeStatus.PRINTED: return 'Imprimé';
      case BadgeStatus.CLOSED: return 'Fermé';
      default: return status || 'Inconnu';
    }
  }

  openCreateModal() {
    this.editingVisit = null;
    this.visitForm = { 
      statut: 'PLANIFIEE',
      dateDebut: new Date()
    };
    this.showModal = true;
  }

  editVisit(visit: Visite) {
    this.editingVisit = visit;
    this.visitForm = { 
      visiteurId: visit.visiteurId,
      employeId: visit.employeId,
      motif: visit.motif,
      statut: visit.statut,
      dateDebut: visit.dateDebut ? new Date(visit.dateDebut) : new Date(),
      dateFin: visit.dateFin ? new Date(visit.dateFin) : undefined
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingVisit = null;
    this.visitForm = {};
  }

  saveVisit() {
    if (this.editingVisit) {
      this.apiService.updateVisite(this.editingVisit.id, this.visitForm).subscribe({
        next: () => {
          this.loadVisits();
          this.dashboardUpdateService.triggerDashboardUpdate(); // Notifier le dashboard
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.handleVisitError(error, 'modification');
        }
      });
    } else {
      this.apiService.createVisite(this.visitForm).subscribe({
        next: () => {
          this.loadVisits();
          this.dashboardUpdateService.triggerDashboardUpdate(); // Notifier le dashboard
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.handleVisitError(error, 'création');
        }
      });
    }
  }

  checkoutVisit(visit: Visite) {
    this.apiService.checkOutVisit(visit.id).subscribe({
      next: () => {
        // Enregistrer un scan de badge pour la fin de visite
        if (visit.badge) {
          this.recordBadgeScan(visit.badge.qrCode, 'check-out', visit);
        }
        
        this.loadVisits();
        this.dashboardUpdateService.triggerDashboardUpdate(); // Notifier le dashboard
      },
      error: (error) => {
        console.error('Erreur lors du check-out:', error);
        this.handleVisitError(error, 'check-out');
      }
    });
  }

  deleteVisit(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      this.apiService.deleteVisite(id).subscribe({
        next: () => {
          this.loadVisits();
          this.dashboardUpdateService.triggerDashboardUpdate(); // Notifier le dashboard
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.handleVisitError(error, 'suppression');
        }
      });
    }
  }

  private handleVisitError(error: any, action: string): void {
    let errorMessage = `Erreur lors de la ${action} de la visite`;
    let notificationType: 'error' | 'warning' = 'error';

    if (error.status === 409) {
      // Conflit - visiteur a déjà une visite active
      errorMessage = error.error?.message || 'Ce visiteur a déjà une visite en cours. Impossible de créer une nouvelle visite.';
      notificationType = 'warning';
    } else if (error.status === 403) {
      // Visiteur blacklisté
      errorMessage = error.error?.message || 'Ce visiteur est blacklisté. Impossible de créer une visite.';
      notificationType = 'warning';
    } else if (error.status === 400) {
      // Données invalides
      errorMessage = error.error?.message || 'Les données fournies sont invalides.';
    } else if (error.status === 404) {
      // Ressource non trouvée
      errorMessage = error.error?.message || 'La ressource demandée n\'a pas été trouvée.';
    } else if (error.status === 500) {
      // Erreur serveur
      errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
    }

    // Afficher la notification
    this.toastService.showToast(notificationType, 'Erreur', errorMessage, 5000);
    
    // Debug info available in browser dev tools
  }

  getDateString(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  }

  setDate(dateString: string) {
    if (dateString) {
      this.visitForm.dateDebut = new Date(dateString);
    }
  }

  // Méthodes pour l'aperçu du badge
  previewBadge(badge: Badge) {
    // Utiliser le service pour ouvrir l'aperçu du badge
    this.badgePreviewService.openBadgePreview(badge.qrCode);
    this.showBadgePreview = true;
  }

  // Gérer le clic sur le badge selon le contexte
  handleBadgeClick(visit: Visite) {
    if (visit.badge?.status === 'GENERATED') {
      // Si le badge est généré, ouvrir l'aperçu pour impression
      this.previewBadge(visit.badge);
    } else if (visit.statut === 'EN_COURS') {
      // Si la visite est en cours, ouvrir le modal de scan/check-out
      this.openScanModal(visit);
    }
  }

  // Ouvrir le modal de scan/check-out
  openScanModal(visit: Visite) {
    this.selectedVisitForScan = visit;
    this.showScanModal = true;
  }

  // Fermer le modal de scan
  closeScanModal() {
    this.showScanModal = false;
    this.selectedVisitForScan = null;
  }

  // Effectuer le check-out depuis le modal
  performCheckout(visit: Visite) {
    if (!confirm(`Confirmer la fin de visite pour ${visit.visiteur?.prenom} ${visit.visiteur?.nom} ?`)) {
      return;
    }

    this.apiService.checkOutVisit(visit.id).subscribe({
      next: () => {
        // Enregistrer un scan de badge pour la fin de visite
        if (visit.badge) {
          this.recordBadgeScan(visit.badge.qrCode, 'check-out', visit);
        }
        
        this.toastService.showToast('success', 'Visite terminée', `La visite de ${visit.visiteur?.prenom} ${visit.visiteur?.nom} a été terminée avec succès`, 3000);
        
        // Mettre à jour localement le statut de la visite
        visit.statut = 'TERMINEE';
        visit.dateFin = new Date();
        
        // Recharger les données
        this.loadVisits();
        
        // Déclencher la mise à jour des dashboards avec un petit délai
        setTimeout(() => {
          this.dashboardUpdateService.triggerDashboardUpdate();
        }, 100);
        
        this.closeScanModal();
      },
      error: (error) => {
        console.error('Erreur lors du check-out:', error);
        this.handleVisitError(error, 'check-out');
      }
    });
  }

  // Obtenir la classe CSS du bouton badge selon le contexte
  getBadgeButtonClass(visit: Visite): string {
    const baseClass = "text-xs font-mono px-2 py-1 rounded border transition-colors cursor-pointer";
    
    if (visit.badge?.status === 'GENERATED') {
      return `${baseClass} text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300`;
    } else if (visit.statut === 'EN_COURS') {
      return `${baseClass} text-green-600 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300`;
    }
    
    return `${baseClass} text-gray-500 bg-gray-100 border-gray-200`;
  }

  // Obtenir le titre du bouton badge selon le contexte
  getBadgeButtonTitle(visit: Visite): string {
    if (visit.badge?.status === 'GENERATED') {
      return "Cliquer pour aperçu et impression";
    } else if (visit.statut === 'EN_COURS') {
      return "Cliquer pour scan et check-out";
    }
    return "";
  }

  closeBadgePreview() {
    this.showBadgePreview = false;
  }

  onBadgePrinted(badgeId: string) {
    // Mettre à jour le statut du badge après impression
    const badge = this.visits.find(v => v.badge?.id === badgeId)?.badge;
    if (badge) {
      badge.status = BadgeStatus.PRINTED;
      this.toastService.showToast('success', 'Badge imprimé', 'Le badge a été marqué comme imprimé', 3000);
      
      // Déclencher la mise à jour des dashboards
      this.dashboardUpdateService.triggerDashboardUpdate();
    }
    this.closeBadgePreview();
  }

  // Enregistrer un scan de badge
  private recordBadgeScan(qrCode: string, action: string, visit: Visite) {
    // Enregistrer le scan avec toutes les informations nécessaires
    const scanData = {
      qrCode: qrCode,
      action: action as 'scan' | 'check-out',
      visitorName: visit.visiteur ? `${visit.visiteur.prenom} ${visit.visiteur.nom}` : undefined,
      employeeName: visit.employe ? `${visit.employe.prenom} ${visit.employe.nom}` : undefined,
      departmentName: visit.employe?.department?.nom,
      visitId: visit.id,
      badgeId: visit.badge?.id
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
