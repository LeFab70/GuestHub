import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { PasswordInputComponent } from '../shared/password-input.component';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONNISTE';
  isActive: boolean;
  passwordResetRequired?: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordInputComponent],
  template: `
    <div class="space-y-6">
      <!-- En-tête avec bouton d'ajout -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p class="text-gray-600">Créez et gérez les comptes utilisateurs du système</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <span class="material-icons mr-2">person_add</span>
          Nouvel Utilisateur
        </button>
      </div>

      <!-- Filtres et recherche -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
              placeholder="Nom, prénom ou email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select 
              [(ngModel)]="selectedRole"
              (change)="filterUsers()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                     <option value="">Tous les rôles</option>
                     <option value="ADMIN">Administrateur</option>
                     <option value="RECEPTIONNISTE">Réceptionniste</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select 
              [(ngModel)]="selectedStatus"
              (change)="filterUsers()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Chargement des utilisateurs...</span>
      </div>

      <!-- Error state -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="material-icons text-red-400">error</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erreur</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau des utilisateurs -->
      <div *ngIf="!isLoading && !errorMessage" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ user.prenom?.charAt(0) || user.email?.charAt(0) || 'U' }}{{ user.nom?.charAt(0) || '' }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.prenom && user.nom ? user.prenom + ' ' + user.nom : user.email }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getRoleClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div *ngIf="user.lastLogin; else neverConnected" class="text-gray-900">
                    <div class="font-medium">{{ user.lastLogin | date:'dd/MM/yyyy' }}</div>
                    <div class="text-gray-500">{{ user.lastLogin | date:'HH:mm' }}</div>
                  </div>
                  <ng-template #neverConnected>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Jamais
                    </span>
                  </ng-template>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      (click)="editUser(user)"
                      class="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors" 
                      title="Modifier l'utilisateur">
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      (click)="toggleUserStatus(user)"
                      [class]="getToggleButtonClass(user.isActive)"
                      [title]="getToggleButtonTitle(user.isActive)">
                      <span class="material-icons text-sm">{{ user.isActive ? 'person_off' : 'person_add' }}</span>
                    </button>
                    <button 
                      (click)="resetUserPassword(user)"
                      class="text-orange-600 hover:text-orange-900 p-2 rounded-full hover:bg-orange-50 transition-colors" 
                      title="Réinitialiser le mot de passe">
                      <span class="material-icons text-sm">lock_reset</span>
                    </button>
                    <button 
                      (click)="deleteUser(user)"
                      class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors" 
                      title="Supprimer l'utilisateur">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!isLoading && !errorMessage" class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Affichage de {{ filteredUsers.length }} utilisateur(s)
        </div>
        <div class="flex space-x-2">
          <button 
            (click)="previousPage()"
            [disabled]="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Précédent
          </button>
          <button 
            (click)="nextPage()"
            [disabled]="currentPage >= totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de création/édition d'utilisateur -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ modalTitle }}
          </h3>
          <button 
            (click)="closeModal()" 
            class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form (ngSubmit)="saveUser()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
            <input 
              type="text" 
              [(ngModel)]="userForm.prenom"
              (input)="generateLoginFromForm()"
              name="prenom"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input 
              type="text" 
              [(ngModel)]="userForm.nom"
              (input)="generateLoginFromForm()"
              name="nom"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              [(ngModel)]="userForm.email"
              (input)="generateLoginFromForm()"
              name="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select 
              [(ngModel)]="userForm.role"
              name="role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="RECEPTIONNISTE">Réceptionniste</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div *ngIf="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe temporaire généré</label>
            <div class="relative">
              <input 
                type="text" 
                [value]="userForm.password"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono pr-10">
              <button 
                type="button"
                (click)="userForm.password = generateRandomPassword()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Mot de passe généré automatiquement. L'utilisateur devra le changer lors de sa première connexion.</p>
          </div>

          <div class="flex items-center">
            <input 
              type="checkbox" 
              [(ngModel)]="userForm.isActive"
              name="isActive"
              id="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="isActive" class="ml-2 block text-sm text-gray-900">
              Compte actif
            </label>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Annuler
            </button>
            <button 
              type="submit"
              [disabled]="isSaving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
              {{ isSaving ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dialogue de mot de passe temporaire -->
    <div *ngIf="showTemporaryPasswordDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span class="material-icons text-orange-600 text-xl">admin_panel_settings</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Mot de passe temporaire</h3>
            </div>
            <button 
              (click)="closeTemporaryPasswordDialog()" 
              class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-icons text-xl">close</span>
            </button>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-3">
              Mot de passe temporaire généré pour <strong>{{ temporaryPasswordData.email }}</strong>
            </p>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <code class="text-lg font-mono text-gray-800 break-all">{{ temporaryPasswordData.password }}</code>
                <button 
                  (click)="copyTemporaryPassword()" 
                  class="ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copier le mot de passe">
                  <span class="material-icons text-xl">content_copy</span>
                </button>
              </div>
            </div>
          </div>

          <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div class="flex items-start space-x-2">
              <span class="material-icons text-orange-600 text-sm mt-0.5">info</span>
              <p class="text-sm text-orange-800">
                Communiquez ce mot de passe à l'utilisateur. Il devra définir un nouveau mot de passe lors de sa prochaine connexion.
              </p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button 
              (click)="closeTemporaryPasswordDialog()" 
              class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Fermer
            </button>
            <button 
              (click)="copyTemporaryPassword()" 
              class="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
              Copier le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  showModal = false;
  isEditing = false;
  isSaving = false;
  showTemporaryPasswordDialog = false;
  userForm = {
    id: '',
    login: '',
    prenom: '',
    nom: '',
    email: '',
    role: 'RECEPTIONNISTE' as 'ADMIN' | 'RECEPTIONNISTE',
    password: '',
    isActive: true
  };

  isLoading = false;
  errorMessage = '';

  // Dialogue de mot de passe temporaire
  temporaryPasswordData = {
    password: '',
    email: ''
  };

  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  get modalTitle(): string {
    return this.isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur';
  }

  getToggleButtonTitle(isActive: boolean): string {
    return isActive ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur';
  }

  getToggleButtonClass(isActive: boolean): string {
    return isActive 
      ? 'text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors'
      : 'text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors';
  }

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté avant de charger les données
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUsers();
      } else {
        this.errorMessage = 'Vous devez être connecté pour accéder à cette page';
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data.map((user: any) => ({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
          }));
          this.filterUsers();
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des utilisateurs';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
      }
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  openCreateModal() {
    this.isEditing = false;
    this.userForm = {
      id: '',
      login: '',
      prenom: '',
      nom: '',
      email: '',
      role: 'RECEPTIONNISTE',
      password: this.generateRandomPassword(),
      isActive: true
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  editUser(user: User) {
    this.isEditing = true;
    this.userForm = {
      id: user.id || '',
      login: user.email || '', // Use email as login
      prenom: user.prenom || '',
      nom: user.nom || '',
      email: user.email || '',
      role: (user.role === 'ADMIN' || user.role === 'RECEPTIONNISTE') ? user.role : 'RECEPTIONNISTE',
      password: '', // Never populate password in edit mode
      isActive: user.isActive !== undefined ? user.isActive : true
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.isSaving = false;
  }

  generateLogin(prenom: string, nom: string, email: string): string {
    // Use email as login (it's already unique and valid)
    return email;
  }

  generateLoginFromForm() {
    // Always update login to match email
    this.userForm.login = this.userForm.email || '';
  }

  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async saveUser() {
    // Generate login if not provided or too short
    if (!this.userForm.login || this.userForm.login.length < 3) {
      this.userForm.login = this.generateLogin(
        this.userForm.prenom || '', 
        this.userForm.nom || '', 
        this.userForm.email || ''
      );
    }
    
    this.isSaving = true;
    
    try {
      if (this.isEditing) {
        // Update user (remove password from update data)
        const { password, ...updateData } = this.userForm;
        
        this.apiService.updateUser(this.userForm.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur modifié', 'L\'utilisateur a été modifié avec succès');
              this.loadUsers();
              this.closeModal();
            } else {
              this.toastService.error('Erreur de modification', response.error || response.message || 'Une erreur est survenue lors de la modification de l\'utilisateur.');
            }
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error('Erreur de modification', errorMessage);
            this.isSaving = false;
          }
        });
      } else {
        // Create user
        this.apiService.createUser(this.userForm).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur créé', `L'utilisateur a été créé avec succès. Mot de passe temporaire: ${this.userForm.password}`);
              this.loadUsers();
              this.closeModal();
            } else {
              this.toastService.error('Erreur de création', response.error || response.message || 'Une erreur est survenue lors de la création de l\'utilisateur.');
            }
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error creating user:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error('Erreur de création', errorMessage);
            this.isSaving = false;
          }
        });
      }
    } catch (error) {
      this.toastService.error('Erreur', 'Une erreur est survenue lors de la sauvegarde');
      this.isSaving = false;
    }
  }

  getErrorMessage(error: any): string {
    if (error.error) {
      if (error.error.details && Array.isArray(error.error.details)) {
        return error.error.details.map((detail: any) => detail.message).join(', ');
      }
      if (error.error.error) {
        return error.error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  async toggleUserStatus(user: User) {
    try {
      const updatedUser = { ...user, isActive: !user.isActive };
      this.apiService.updateUser(user.id, updatedUser).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(
              'Statut modifié',
              `L'utilisateur ${user.prenom} ${user.nom} est maintenant ${user.isActive ? 'inactif' : 'actif'}`
            );
            this.loadUsers();
          } else {
            this.toastService.error('Erreur', response.message || 'Erreur lors de la modification du statut');
          }
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.toastService.error('Erreur', 'Une erreur est survenue lors de la modification du statut');
        }
      });
    } catch (error) {
      this.toastService.error('Erreur', 'Une erreur est survenue lors de la modification du statut');
    }
  }

  async resetUserPassword(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${user.prenom} ${user.nom} ? L'utilisateur devra définir un nouveau mot de passe lors de sa prochaine connexion.`)) {
      try {
        this.apiService.resetUserPassword(user.id).subscribe({
          next: (response) => {
            if (response.success) {
              const tempPassword = response.data?.tempPassword;
              const message = tempPassword 
                ? `Mot de passe réinitialisé avec succès.\n\nMot de passe temporaire: ${tempPassword}\n\nL'utilisateur devra définir un nouveau mot de passe lors de sa prochaine connexion.`
                : 'Le mot de passe a été réinitialisé avec succès. L\'utilisateur devra définir un nouveau mot de passe lors de sa prochaine connexion.';
              
              this.toastService.success('Mot de passe réinitialisé', message);
              
              // Afficher le mot de passe temporaire dans un dialogue élégant
              if (tempPassword) {
                this.openTemporaryPasswordDialog(tempPassword, user.email);
              }
              
              this.loadUsers();
            } else {
              this.toastService.error('Erreur', response.message || 'Erreur lors de la réinitialisation du mot de passe');
            }
          },
          error: (error) => {
            console.error('Error resetting user password:', error);
            this.toastService.error('Erreur', 'Une erreur est survenue lors de la réinitialisation du mot de passe');
          }
        });
      } catch (error) {
        this.toastService.error('Erreur', 'Une erreur est survenue lors de la réinitialisation du mot de passe');
      }
    }
  }

  async deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      try {
        this.apiService.deleteUser(user.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès');
              this.loadUsers();
            } else {
              this.toastService.error('Erreur', response.message || 'Erreur lors de la suppression');
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.toastService.error('Erreur', 'Une erreur est survenue lors de la suppression');
          }
        });
      } catch (error) {
        this.toastService.error('Erreur', 'Une erreur est survenue lors de la suppression');
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'RECEPTIONNISTE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'RECEPTIONNISTE': return 'Réceptionniste';
      default: return role;
    }
  }

  // Méthodes pour le dialogue de mot de passe temporaire
  openTemporaryPasswordDialog(tempPassword: string, email: string) {
    this.temporaryPasswordData = {
      password: tempPassword,
      email: email
    };
    this.showTemporaryPasswordDialog = true;
  }

  closeTemporaryPasswordDialog() {
    this.showTemporaryPasswordDialog = false;
    this.temporaryPasswordData = {
      password: '',
      email: ''
    };
  }

  copyTemporaryPassword() {
    navigator.clipboard.writeText(this.temporaryPasswordData.password).then(() => {
      this.toastService.success('Copié !', 'Mot de passe copié dans le presse-papiers');
    }).catch(() => {
      this.toastService.error('Erreur', 'Impossible de copier le mot de passe');
    });
  }
}
