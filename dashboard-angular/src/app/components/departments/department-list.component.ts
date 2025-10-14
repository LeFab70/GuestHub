import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { Departement } from '../../models/user.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Départements</h2>
        <div class="flex items-center space-x-4">
          <!-- Barre de recherche -->
          <div class="flex items-center space-x-2">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="onSearchChange()"
              placeholder="Rechercher par nom..."
              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64">
          </div>
          
          <button 
            (click)="openCreateModal()" 
            class="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouveau Département
          </button>
        </div>
      </div>

      <!-- Tableau des départements -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngIf="filteredDepartments.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                Aucun département trouvé
              </td>
            </tr>
            <tr *ngFor="let department of filteredDepartments">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ department.nom }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ department.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editDepartment(department)" 
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Modifier
                </button>
                <button (click)="deleteDepartment(department.id)" 
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Supprimer
                </button>
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
              {{ editingDepartment ? 'Modifier le département' : 'Nouveau département' }}
            </h3>
            <form (ngSubmit)="saveDepartment()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <input [(ngModel)]="departmentForm.nom" name="nom" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea [(ngModel)]="departmentForm.description" name="description" rows="3"
                          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
              </div>
              <div class="flex justify-end space-x-3">
                <button type="button" (click)="closeModal()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Annuler
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {{ editingDepartment ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DepartmentListComponent implements OnInit {
  departments: Departement[] = [];
  searchTerm: string = '';
  filteredDepartments: Departement[] = [];
  showModal = false;
  editingDepartment: Departement | null = null;
  departmentForm: Partial<Departement> = {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté avant de charger les données
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadDepartments();
      } else {
        console.error('Utilisateur non connecté');
      }
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredDepartments = this.departments.filter(department => {
      // Filtre par recherche de nom
      const matchesSearch = !this.searchTerm || 
        department.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  loadDepartments() {
    this.apiService.getDepartements().subscribe({
      next: (response) => {
        if (response.success && response.data && Array.isArray(response.data.data)) {
          this.departments = response.data.data;
        } else if (response.success && Array.isArray(response.data)) {
          this.departments = response.data;
        } else if (Array.isArray(response)) {
          this.departments = response;
        } else {
          this.departments = [];
          console.error('Format de données invalide pour les départements:', response);
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.departments = [];
        this.applyFilters();
      }
    });
  }

  openCreateModal() {
    this.editingDepartment = null;
    this.departmentForm = {};
    this.showModal = true;
  }

  editDepartment(department: Departement) {
    this.editingDepartment = department;
    this.departmentForm = { ...department };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingDepartment = null;
    this.departmentForm = {};
  }

  saveDepartment() {
    if (this.editingDepartment) {
      this.apiService.updateDepartement(this.editingDepartment.id, this.departmentForm).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la modification:', error)
      });
    } else {
      this.apiService.createDepartement(this.departmentForm).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => console.error('Erreur lors de la création:', error)
      });
    }
  }

  deleteDepartment(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      this.apiService.deleteDepartement(id).subscribe({
        next: () => this.loadDepartments(),
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }
}
