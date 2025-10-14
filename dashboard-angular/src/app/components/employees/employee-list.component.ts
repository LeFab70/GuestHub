import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Employe, Departement } from '../../models/user.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Employés</h2>
        <div class="flex items-center space-x-4">
          <!-- Filtre de statut -->
          <div class="flex items-center space-x-2">
            <label for="statusFilter" class="text-sm font-medium text-gray-700">Statut:</label>
            <select 
              id="statusFilter"
              [(ngModel)]="statusFilter" 
              (change)="onStatusFilterChange()"
              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
          <button 
            (click)="openCreateModal()" 
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Nouvel Employé
          </button>
        </div>
      </div>

      <!-- Tableau des employés -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let employee of employees">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ employee.prenom }} {{ employee.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ employee.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ employee.department?.nom || 'Non assigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ employee.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editEmployee(employee)" 
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Modifier
                </button>
                <button (click)="toggleEmployeeStatus(employee)" 
                        [class]="employee.isActive ? 'inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded' : 'inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-900 hover:bg-green-50 rounded'">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="employee.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                    <path *ngIf="!employee.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ employee.isActive ? 'Désactiver' : 'Activer' }}
                </button>
                <button (click)="deleteEmployee(employee.id)" 
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
              {{ editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé' }}
            </h3>
            <form (ngSubmit)="saveEmployee()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prénom</label>
                <input [(ngModel)]="employeeForm.prenom" name="prenom" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <input [(ngModel)]="employeeForm.nom" name="nom" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input [(ngModel)]="employeeForm.email" name="email" type="email" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                <input [(ngModel)]="employeeForm.telephone" name="telephone" type="tel"
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Poste</label>
                <input [(ngModel)]="employeeForm.poste" name="poste" type="text"
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Département</label>
                <select [(ngModel)]="employeeForm.departmentId" name="departmentId"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Sélectionner un département</option>
                  <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.nom }}</option>
                </select>
              </div>
              <div class="flex items-center">
                <input [(ngModel)]="employeeForm.isActive" name="isActive" type="checkbox" 
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
                  {{ editingEmployee ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  employees: Employe[] = [];
  departments: Departement[] = [];
  showModal = false;
  editingEmployee: Employe | null = null;
  employeeForm: Partial<Employe> = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    departmentId: '',
    isActive: true
  };
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees() {
    // Construire les paramètres de requête
    const params: any = {};
    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.apiService.getEmployes(params).subscribe({
      next: (response) => {
        if (response.success && response.data && Array.isArray(response.data.data)) {
          this.employees = response.data.data;
        } else if (response.success && Array.isArray(response.data)) {
          this.employees = response.data;
        } else if (Array.isArray(response)) {
          this.employees = response;
        } else {
          this.employees = [];
          console.error('Format de données invalide:', response);
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
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.departments = [];
      }
    });
  }

  openCreateModal() {
    this.editingEmployee = null;
    this.employeeForm = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      poste: '',
      departmentId: '',
      isActive: true
    };
    this.showModal = true;
  }

  editEmployee(employee: Employe) {
    this.editingEmployee = employee;
    this.employeeForm = { ...employee };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEmployee = null;
    this.employeeForm = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      poste: '',
      departmentId: '',
      isActive: true
    };
  }

  saveEmployee() {
    // Validation côté frontend
    if (!this.employeeForm.prenom || this.employeeForm.prenom.length < 2) {
      this.toastService.error('Validation', 'Le prénom doit contenir au moins 2 caractères');
      return;
    }
    if (!this.employeeForm.nom || this.employeeForm.nom.length < 2) {
      this.toastService.error('Validation', 'Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (!this.employeeForm.email || !this.employeeForm.email.includes('@')) {
      this.toastService.error('Validation', 'Veuillez saisir un email valide');
      return;
    }

    if (this.editingEmployee) {
      this.apiService.updateEmploye(this.editingEmployee.id, this.employeeForm).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Employé modifié avec succès');
          this.loadEmployees();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.toastService.error('Erreur', 'Erreur lors de la modification: ' + (error.error?.message || error.message || 'Erreur inconnue'));
        }
      });
    } else {
      this.apiService.createEmploye(this.employeeForm).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Employé créé avec succès');
          this.loadEmployees();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.toastService.error('Erreur', 'Erreur lors de la création: ' + (error.error?.message || error.message || 'Erreur inconnue'));
        }
      });
    }
  }

  toggleEmployeeStatus(employee: Employe) {
    if (employee.isActive) {
      // Désactiver l'employé
      this.apiService.deactivateEmploye(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
          this.toastService.success('Succès', `Employé ${employee.prenom} ${employee.nom} désactivé avec succès`);
        },
        error: (error) => {
          console.error('Erreur lors de la désactivation:', error);
          this.toastService.error('Erreur', 'Erreur lors de la désactivation: ' + (error.error?.message || error.message || 'Erreur inconnue'));
        }
      });
    } else {
      // Activer l'employé
      this.apiService.activateEmploye(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
          this.toastService.success('Succès', `Employé ${employee.prenom} ${employee.nom} activé avec succès`);
        },
        error: (error) => {
          console.error('Erreur lors de l\'activation:', error);
          this.toastService.error('Erreur', 'Erreur lors de l\'activation: ' + (error.error?.message || error.message || 'Erreur inconnue'));
        }
      });
    }
  }

  onStatusFilterChange() {
    this.loadEmployees();
  }

  deleteEmployee(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.apiService.deleteEmploye(id).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Employé supprimé avec succès');
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.error('Erreur', 'Erreur lors de la suppression: ' + (error.error?.message || error.message || 'Erreur inconnue'));
        }
      });
    }
  }
}
