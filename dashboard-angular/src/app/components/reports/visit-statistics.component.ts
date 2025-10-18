import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

interface VisitStatistics {
  totalVisits: number;
  visitsByDepartment: Array<{
    departmentName: string;
    count: number;
  }>;
  visitsByEmployee: Array<{
    employeeName: string;
    departmentName: string;
    count: number;
  }>;
  visitsByStatus: Array<{
    status: string;
    count: number;
  }>;
  visitsByDate: Array<{
    date: string;
    count: number;
  }>;
}

@Component({
  selector: 'app-visit-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span class="material-icons text-xl mr-2">analytics</span>
        Statistiques des Visites
      </h3>

      <!-- Filtres -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Début</label>
          <input [(ngModel)]="dateFrom" type="date" 
                 class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Fin</label>
          <input [(ngModel)]="dateTo" type="date" 
                 class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Critère</label>
          <select [(ngModel)]="criteria" 
                  (ngModelChange)="onCriteriaChange()"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="department">Département</option>
            <option value="employee">Employé</option>
            <option value="status">Statut</option>
            <option value="date">Par Date</option>
          </select>
        </div>
        <div class="flex items-end">
          <button (click)="generateStatistics()" 
                  [disabled]="isLoading"
                  class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
            <span *ngIf="isLoading" class="material-icons text-sm mr-2 animate-spin">refresh</span>
            <span *ngIf="!isLoading" class="material-icons text-sm mr-2">search</span>
            {{ isLoading ? 'Génération...' : 'Générer' }}
          </button>
        </div>
      </div>

      <!-- Résultats -->
      <div *ngIf="statistics && !isLoading" class="space-y-6">
        <!-- Résumé général -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-md font-semibold text-gray-800 mb-2">Résumé</h4>
          <p class="text-gray-600">
            <strong>{{ statistics.totalVisits }}</strong> visite(s) terminée(s) ou expirée(s) 
            du {{ formatDate(dateFrom) }} au {{ formatDate(dateTo) }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            <span class="material-icons text-sm mr-1">info</span>
            Seules les visites avec badges fermés sont comptabilisées
          </p>
        </div>

        <!-- Statistiques par critère -->
        <div *ngIf="criteria === 'department' && statistics.visitsByDepartment.length > 0" class="space-y-4">
          <h4 class="text-md font-semibold text-gray-800">Par Département</h4>
          <div class="grid gap-3">
            <div *ngFor="let dept of statistics.visitsByDepartment" 
                 class="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span class="font-medium text-blue-900">{{ dept.departmentName }}</span>
              <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {{ dept.count }} visite(s)
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="criteria === 'employee' && statistics.visitsByEmployee.length > 0" class="space-y-4">
          <h4 class="text-md font-semibold text-gray-800">Par Employé</h4>
          <div class="grid gap-3">
            <div *ngFor="let emp of statistics.visitsByEmployee" 
                 class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <span class="font-medium text-green-900">{{ emp.employeeName }}</span>
                <span class="text-sm text-green-700 ml-2">({{ emp.departmentName }})</span>
              </div>
              <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {{ emp.count }} visite(s)
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="criteria === 'status' && statistics.visitsByStatus.length > 0" class="space-y-4">
          <h4 class="text-md font-semibold text-gray-800">Par Statut</h4>
          <div class="grid gap-3">
            <div *ngFor="let status of statistics.visitsByStatus" 
                 class="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span class="font-medium text-purple-900">{{ getStatusLabel(status.status) }}</span>
              <span class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {{ status.count }} visite(s)
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="criteria === 'date' && statistics.visitsByDate.length > 0" class="space-y-4">
          <h4 class="text-md font-semibold text-gray-800">Par Date</h4>
          <div class="grid gap-3">
            <div *ngFor="let date of statistics.visitsByDate" 
                 class="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span class="font-medium text-orange-900">{{ formatDate(date.date) }}</span>
              <span class="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {{ date.count }} visite(s)
              </span>
            </div>
          </div>
        </div>

        <!-- Message si aucun résultat -->
        <div *ngIf="getCurrentResults().length === 0" class="text-center py-8 text-gray-500">
          <span class="material-icons text-4xl mb-2">inbox</span>
          <p>Aucune donnée trouvée pour les critères sélectionnés</p>
        </div>
      </div>

      <!-- Message de chargement -->
      <div *ngIf="isLoading" class="text-center py-8">
        <span class="material-icons text-4xl mb-2 animate-spin">refresh</span>
        <p class="text-gray-500">Génération des statistiques...</p>
      </div>
    </div>
  `
})
export class VisitStatisticsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  dateFrom: string = '';
  dateTo: string = '';
  criteria: string = 'department';
  statistics: VisitStatistics | null = null;
  isLoading = false;

  ngOnInit() {
    // Initialiser avec la date d'aujourd'hui
    const today = new Date();
    this.dateTo = today.toISOString().split('T')[0];
    
    // Date de début : il y a 7 jours
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    this.dateFrom = weekAgo.toISOString().split('T')[0];
    
    // Générer les statistiques initiales
    this.generateStatistics();
  }

  generateStatistics() {
    if (!this.dateFrom || !this.dateTo) {
      this.toastService.error('Erreur', 'Veuillez sélectionner une période');
      return;
    }

    this.isLoading = true;
    this.statistics = null; // Reset statistics before loading new ones
    
    this.apiService.getVisitStatistics(this.dateFrom, this.dateTo, this.criteria).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.statistics = response.data;
          this.toastService.success('Succès', 'Statistiques générées avec succès');
        } else {
          this.toastService.error('Erreur', response.message || 'Erreur lors de la génération des statistiques');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de la génération des statistiques:', error);
        this.toastService.error('Erreur', 'Erreur lors de la génération des statistiques');
      }
    });
  }

  onCriteriaChange() {
    // Générer automatiquement les statistiques quand le critère change
    if (this.dateFrom && this.dateTo) {
      this.generateStatistics();
    }
  }

  getCurrentResults() {
    if (!this.statistics) return [];
    
    switch (this.criteria) {
      case 'department': return this.statistics.visitsByDepartment;
      case 'employee': return this.statistics.visitsByEmployee;
      case 'status': return this.statistics.visitsByStatus;
      case 'date': return this.statistics.visitsByDate;
      default: return [];
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
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
}
