import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Visiteur, VisiteurStatus } from '../../models/user.model';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Visiteurs</h2>
        <button 
          (click)="openCreateModal()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Nouveau Visiteur
        </button>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterVisitors()" 
                   placeholder="Nom, email, téléphone..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Statut</label>
            <select [(ngModel)]="statusFilter" (change)="filterVisitors()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous</option>
              <option value="ACTIF">Actif</option>
              <option value="BLACKLISTED">Blacklisté</option>
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

      <!-- Tableau des visiteurs -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let visitor of filteredVisitors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ visitor.prenom }} {{ visitor.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ visitor.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ visitor.telephone }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="visitor.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ visitor.status === 'ACTIF' ? 'Actif' : 'Blacklisté' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editVisitor(visitor)" class="text-indigo-600 hover:text-indigo-900">Modifier</button>
                <button (click)="toggleVisitorStatus(visitor)" 
                        [class]="visitor.status === 'ACTIF' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                  {{ visitor.status === 'ACTIF' ? 'Blacklister' : 'Activer' }}
                </button>
                <button (click)="deleteVisitor(visitor.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
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
              {{ editingVisitor ? 'Modifier le visiteur' : 'Nouveau visiteur' }}
            </h3>
            <form (ngSubmit)="saveVisitor()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prénom</label>
                <input [(ngModel)]="visitorForm.prenom" name="prenom" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <input [(ngModel)]="visitorForm.nom" name="nom" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input [(ngModel)]="visitorForm.email" name="email" type="email" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                <input [(ngModel)]="visitorForm.telephone" name="telephone" type="tel" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Login</label>
                <input [(ngModel)]="visitorForm.login" name="login" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Statut</label>
                <select [(ngModel)]="visitorForm.status" name="status"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="ACTIF">Actif</option>
                  <option value="BLACKLISTED">Blacklisté</option>
                </select>
              </div>
              <div class="flex items-center">
                <input [(ngModel)]="visitorForm.actif" name="actif" type="checkbox" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <label class="ml-2 block text-sm text-gray-900">Actif</label>
              </div>
              <div class="flex justify-end space-x-3">
                <button type="button" (click)="closeModal()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Annuler
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {{ editingVisitor ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VisitorListComponent implements OnInit {
  visitors: Visiteur[] = [];
  filteredVisitors: Visiteur[] = [];
  showModal = false;
  editingVisitor: Visiteur | null = null;
  visitorForm: Partial<Visiteur> = {};
  searchTerm = '';
  statusFilter = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadVisitors();
  }

  loadVisitors() {
    this.apiService.getVisiteurs().subscribe({
      next: (data) => {
        this.visitors = data;
        this.filterVisitors();
      },
      error: (error) => console.error('Erreur lors du chargement des visiteurs:', error)
    });
  }

  filterVisitors() {
    this.filteredVisitors = this.visitors.filter(visitor => {
      const matchesSearch = !this.searchTerm || 
        visitor.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visitor.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        visitor.telephone.includes(this.searchTerm);
      
      const matchesStatus = !this.statusFilter || visitor.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filterVisitors();
  }

  openCreateModal() {
    this.editingVisitor = null;
    this.visitorForm = { 
      actif: true, 
      status: VisiteurStatus.ACTIF 
    };
    this.showModal = true;
  }

  editVisitor(visitor: Visiteur) {
    this.editingVisitor = visitor;
    this.visitorForm = { ...visitor };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingVisitor = null;
    this.visitorForm = {};
  }

  saveVisitor() {
    if (this.editingVisitor) {
      this.apiService.updateVisiteur(this.editingVisitor.id, this.visitorForm).subscribe({
        next: () => {
          this.loadVisitors();
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la modification:', error)
      });
    } else {
      this.apiService.createVisiteur(this.visitorForm).subscribe({
        next: () => {
          this.loadVisitors();
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la création:', error)
      });
    }
  }

  toggleVisitorStatus(visitor: Visiteur) {
    const newStatus = visitor.status === VisiteurStatus.ACTIF ? 
      VisiteurStatus.BLACKLISTED : VisiteurStatus.ACTIF;
    const updatedVisitor = { ...visitor, status: newStatus };
    
    this.apiService.updateVisiteur(visitor.id, updatedVisitor).subscribe({
      next: () => this.loadVisitors(),
      error: (error) => console.error('Erreur lors du changement de statut:', error)
    });
  }

  deleteVisitor(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
      this.apiService.deleteVisiteur(id).subscribe({
        next: () => this.loadVisitors(),
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }
}
