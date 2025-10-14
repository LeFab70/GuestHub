import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PasswordInputComponent } from '../shared/password-input.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordInputComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 pb-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Profil Utilisateur</h3>
          
          <!-- Informations personnelles -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">Prénom</label>
              <input 
                [value]="userProfile.prenom" 
                type="text" 
                disabled
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nom</label>
              <input 
                [value]="userProfile.nom" 
                type="text" 
                disabled
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                [value]="userProfile.email" 
                type="email" 
                disabled
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rôle</label>
              <input 
                [value]="userProfile.role" 
                type="text" 
                disabled
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
            </div>
          </div>

          <div class="mt-6">
            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">
                    Les informations personnelles (nom, prénom, email) ne peuvent pas être modifiées. 
                    Contactez votre administrateur pour toute modification nécessaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Changement de mot de passe -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Changer le mot de passe</h3>
          
          <form (ngSubmit)="changePassword()" class="space-y-6">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                Mot de passe actuel
              </label>
              <div class="mt-1">
                <app-password-input
                  placeholder="Entrez votre mot de passe actuel"
                  [(ngModel)]="passwordForm.currentPassword"
                  name="currentPassword"
                  required>
                </app-password-input>
              </div>
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div class="mt-1">
                <app-password-input
                  placeholder="Entrez votre nouveau mot de passe"
                  [(ngModel)]="passwordForm.newPassword"
                  name="newPassword"
                  required>
                </app-password-input>
              </div>
              <p class="mt-1 text-sm text-gray-500">Minimum 6 caractères</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le nouveau mot de passe
              </label>
              <div class="mt-1">
                <app-password-input
                  placeholder="Confirmez votre nouveau mot de passe"
                  [(ngModel)]="passwordForm.confirmPassword"
                  name="confirmPassword"
                  required>
                </app-password-input>
              </div>
            </div>

            <div *ngIf="passwordError" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {{ passwordError }}
            </div>

            <div *ngIf="passwordSuccess" class="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {{ passwordSuccess }}
            </div>

            <div class="flex justify-end">
              <button 
                type="submit" 
                [disabled]="isChangingPassword || !isPasswordFormValid()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="isChangingPassword" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isChangingPassword ? 'Changement...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Informations de session -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Informations de session</h3>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Dernière connexion</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ lastLogin | date:'dd/MM/yyyy à HH:mm' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Durée de session</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ sessionDuration }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  userProfile: Partial<User> = {};
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';
  lastLogin = new Date();
  sessionDuration = '';

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userProfile = { ...this.currentUser };
    }
    this.calculateSessionDuration();
  }

  calculateSessionDuration() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Décoder le token JWT pour obtenir l'expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convertir en millisecondes
        const now = Date.now();
        const remaining = exp - now;
        
        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          this.sessionDuration = `${hours}h ${minutes}min`;
        } else {
          this.sessionDuration = 'Expirée';
        }
      } catch (error) {
        this.sessionDuration = 'Non disponible';
      }
    } else {
      this.sessionDuration = 'Non connecté';
    }
  }


  async changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.isPasswordFormValid()) {
      this.passwordError = 'Veuillez remplir tous les champs correctement';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }

    this.isChangingPassword = true;

    try {
      // Appel API pour changer le mot de passe
      this.apiService.changePassword(
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword,
        this.passwordForm.confirmPassword
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordSuccess = 'Mot de passe changé avec succès';
            this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
            this.toastService.success('Succès', 'Mot de passe changé avec succès');
          } else {
            this.passwordError = response.message || 'Erreur lors du changement de mot de passe';
            this.toastService.error('Erreur', this.passwordError);
          }
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.passwordError = 'Erreur lors du changement de mot de passe';
          this.toastService.error('Erreur', this.passwordError);
        }
      });
      
    } catch (error) {
      this.passwordError = 'Erreur lors du changement de mot de passe';
    } finally {
      this.isChangingPassword = false;
    }
  }

  isPasswordFormValid(): boolean {
    return !!(this.passwordForm.currentPassword && 
              this.passwordForm.newPassword && 
              this.passwordForm.confirmPassword &&
              this.passwordForm.newPassword.length >= 6);
  }
}
