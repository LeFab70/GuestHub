import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Visite, Visiteur, Employe, Badge, BadgeEtat } from '../../models/user.model';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterVisits()" 
                   placeholder="Visiteur, motif..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Statut</label>
            <select [(ngModel)]="statusFilter" (change)="filterVisits()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date début</label>
            <input [(ngModel)]="dateFrom" (change)="filterVisits()" type="date"
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
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiteur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Entrée</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let visit of filteredVisits">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ visit.visiteur?.prenom }} {{ visit.visiteur?.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ visit.employe?.prenom }} {{ visit.employe?.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ visit.dateEntree | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ visit.motif }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusClass(visit.status)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ visit.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getBadgeClass(visit.badge?.etat)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ visit.badge?.etat || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editVisit(visit)" class="text-indigo-600 hover:text-indigo-900">Modifier</button>
                <button (click)="checkoutVisit(visit)" *ngIf="visit.status === 'EN_COURS'" 
                        class="text-green-600 hover:text-green-900">Check-out</button>
                <button (click)="deleteVisit(visit.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
                <input [ngModel]="getDateString(visitForm.dateEntree)" (ngModelChange)="setDate($event)" name="dateEntree" type="datetime-local" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Statut</label>
                <select [(ngModel)]="visitForm.status" name="status"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINEE">Terminée</option>
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
    </div>
  `
})
export class VisitListComponent implements OnInit {
  visits: Visite[] = [];
  filteredVisits: Visite[] = [];
  visitors: Visiteur[] = [];
  employees: Employe[] = [];
  showModal = false;
  editingVisit: Visite | null = null;
  visitForm: Partial<Visite> = {};
  searchTerm = '';
  statusFilter = '';
  dateFrom = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadVisits();
    this.loadVisitors();
    this.loadEmployees();
  }

  loadVisits() {
    this.apiService.getVisites().subscribe({
      next: (data) => {
        this.visits = data;
        this.filterVisits();
      },
      error: (error) => console.error('Erreur lors du chargement des visites:', error)
    });
  }

  loadVisitors() {
    this.apiService.getVisiteurs().subscribe({
      next: (data) => this.visitors = data,
      error: (error) => console.error('Erreur lors du chargement des visiteurs:', error)
    });
  }

  loadEmployees() {
    this.apiService.getEmployes().subscribe({
      next: (data) => this.employees = data,
      error: (error) => console.error('Erreur lors du chargement des employés:', error)
    });
  }

  filterVisits() {
    this.filteredVisits = this.visits.filter(visit => {
      const matchesSearch = !this.searchTerm || 
        visit.visiteur?.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visit.visiteur?.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visit.motif.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || visit.status === this.statusFilter;
      
      const matchesDate = !this.dateFrom || 
        new Date(visit.dateEntree) >= new Date(this.dateFrom);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFrom = '';
    this.filterVisits();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getBadgeClass(etat?: BadgeEtat): string {
    switch (etat) {
      case BadgeEtat.VALIDE: return 'bg-green-100 text-green-800';
      case BadgeEtat.IMPRIME: return 'bg-blue-100 text-blue-800';
      case BadgeEtat.RENDU: return 'bg-gray-100 text-gray-800';
      case BadgeEtat.AUTO_EXPIRE: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  openCreateModal() {
    this.editingVisit = null;
    this.visitForm = { 
      status: 'EN_COURS',
      dateEntree: new Date()
    };
    this.showModal = true;
  }

  editVisit(visit: Visite) {
    this.editingVisit = visit;
    this.visitForm = { 
      ...visit,
      dateEntree: visit.dateEntree ? new Date(visit.dateEntree) : new Date()
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
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la modification:', error)
      });
    } else {
      this.apiService.createVisite(this.visitForm).subscribe({
        next: () => {
          this.loadVisits();
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la création:', error)
      });
    }
  }

  checkoutVisit(visit: Visite) {
    const updatedVisit = { 
      ...visit, 
      status: 'TERMINEE',
      dateSortie: new Date()
    };
    
    this.apiService.updateVisite(visit.id, updatedVisit).subscribe({
      next: () => this.loadVisits(),
      error: (error) => console.error('Erreur lors du check-out:', error)
    });
  }

  deleteVisit(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      this.apiService.deleteVisite(id).subscribe({
        next: () => this.loadVisits(),
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }

  getDateString(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  }

  setDate(dateString: string) {
    if (dateString) {
      this.visitForm.dateEntree = new Date(dateString);
    }
  }
}
