import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';
import { PasswordInputComponent } from '../../components/shared/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordInputComponent],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-8 px-4">
      <!-- Logo et titre principal en haut -->
      <div class="mb-8">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span class="material-icons text-3xl text-blue-600">home</span>
          </div>
          <h1 class="text-3xl font-bold text-white">GuestHub</h1>
        </div>
      </div>

      <!-- Contenu principal avec fond cassé et ombre -->
      <div class="w-full max-w-md sm:max-w-lg">
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white border-opacity-20">
            <div class="w-full space-y-4">
        
            <!-- Sélection du type de compte -->
            <div *ngIf="!selectedRole" class="space-y-4">
              <div class="text-center mb-4">
                <h3 class="text-lg font-semibold text-white mb-2">Choisissez votre rôle</h3>
                <p class="text-sm text-blue-200">Sélectionnez le type de compte pour continuer</p>
              </div>
              
              <button 
                (click)="selectRole('RECEPTIONNISTE')" 
                class="group relative w-full flex items-center justify-center py-4 px-4 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-sm font-medium rounded-lg text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                <span class="material-icons text-xl mr-3">person</span>
                <div class="text-left">
                  <div class="font-semibold text-sm">Réceptionniste</div>
                  <div class="text-sm text-blue-100">Gestion des visites et visiteurs</div>
                </div>
              </button>
              
              <button 
                (click)="selectRole('ADMIN')" 
                class="group relative w-full flex items-center justify-center py-4 px-4 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-sm font-medium rounded-lg text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                <span class="material-icons text-xl mr-3">admin_panel_settings</span>
                <div class="text-left">
                  <div class="font-semibold text-sm">Administrateur</div>
                  <div class="text-sm text-blue-100">Gestion complète du système</div>
                </div>
              </button>
            </div>

                <!-- Formulaire de connexion -->
                <div *ngIf="selectedRole" class="space-y-4">
                  <div class="w-full bg-white bg-opacity-95 backdrop-blur-sm py-6 px-6 shadow-2xl rounded-2xl border border-white border-opacity-20">
                    <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center space-x-3">
                        <span class="material-icons text-3xl text-blue-600">
                          {{ selectedRole === 'ADMIN' ? 'admin_panel_settings' : 'person' }}
                        </span>
                        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                          {{ selectedRole === 'ADMIN' ? 'Connexion Admin' : 'Connexion Réception' }}
                        </h3>
                      </div>
                  <button 
                    (click)="goBack()" 
                    class="flex items-center space-x-2 text-base text-gray-500 hover:text-gray-700 transition-colors">
                    <span class="material-icons text-xl">arrow_back</span>
                    <span>Retour</span>
                  </button>
                </div>

                <form (ngSubmit)="login()" class="space-y-5">
                  <div>
                    <label for="email" class="block text-base font-medium text-gray-700 mb-3">
                      <span class="material-icons text-xl mr-2 align-middle">email</span>
                      Adresse email
                    </label>
                    <div class="mt-1">
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        [(ngModel)]="loginForm.email"
                        required 
                        class="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm">
                    </div>
                  </div>

                  <div>
                    <label for="password" class="block text-base font-medium text-gray-700 mb-3">
                      <span class="material-icons text-xl mr-2 align-middle">lock</span>
                      Mot de passe
                    </label>
                    <div class="mt-1">
                      <app-password-input
                        placeholder="Entrez votre mot de passe"
                        [(ngModel)]="loginForm.password"
                        name="password"
                        required>
                      </app-password-input>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <input 
                        id="remember-me" 
                        name="remember-me" 
                        type="checkbox" 
                        [(ngModel)]="loginForm.rememberMe"
                        class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                      <label for="remember-me" class="ml-2 block text-base text-gray-900">
                        Se souvenir de moi
                      </label>
                    </div>

                        <div class="text-base">
                          <button 
                            type="button"
                            (click)="forgotPassword()" 
                            class="font-medium text-blue-600 hover:text-blue-500 flex items-center transition-colors">
                            <span class="material-icons text-lg mr-1">help</span>
                            Mot de passe oublié ?
                          </button>
                        </div>
                  </div>

                  <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-lg flex items-center">
                    <span class="material-icons text-xl mr-3">error</span>
                    <span class="text-base">{{ errorMessage }}</span>
                  </div>

                  <div>
                    <button 
                      type="submit" 
                      [disabled]="isLoading"
                      class="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200">
                      <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-4">
                        <span class="material-icons animate-spin text-xl">refresh</span>
                      </span>
                      <span *ngIf="!isLoading" class="material-icons text-xl mr-3">login</span>
                      {{ isLoading ? 'Connexion...' : 'Se connecter' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Mot de passe oublié -->
      <div *ngIf="showForgotPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 flex items-center">
              <span class="material-icons text-blue-600 mr-3 text-2xl">lock_reset</span>
              Mot de passe oublié
            </h3>
            <button 
              (click)="closeForgotPasswordModal()" 
              class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-icons text-2xl">close</span>
            </button>
          </div>
          
          <p class="text-base text-gray-600 mb-6">
            Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          
          <div class="space-y-5">
            <div>
              <label for="forgot-email" class="block text-base font-medium text-gray-700 mb-3">
                <span class="material-icons text-lg mr-2 align-middle">email</span>
                Adresse email
              </label>
              <input 
                id="forgot-email" 
                type="email" 
                [(ngModel)]="forgotPasswordEmail"
                placeholder="votre.email@exemple.com"
                class="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base">
            </div>
            
            <div class="flex space-x-4">
              <button 
                (click)="closeForgotPasswordModal()" 
                class="flex-1 px-6 py-4 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Annuler
              </button>
              <button 
                (click)="submitForgotPassword()" 
                class="flex-1 px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réinitialisation de mot de passe -->
    <div *ngIf="showPasswordResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Définir un nouveau mot de passe
          </h3>
        </div>

        <div class="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p class="text-sm text-orange-800">
            <strong>Réinitialisation requise</strong><br>
            Votre mot de passe a été réinitialisé par un administrateur. 
            Veuillez définir un nouveau mot de passe pour continuer.
          </p>
        </div>

        <form (ngSubmit)="setNewPassword()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <app-password-input
              placeholder="Entrez votre nouveau mot de passe"
              [(ngModel)]="newPasswordForm.password"
              name="password"
              required>
            </app-password-input>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <app-password-input
              placeholder="Confirmez votre nouveau mot de passe"
              [(ngModel)]="newPasswordForm.confirmPassword"
              name="confirmPassword"
              required>
            </app-password-input>
          </div>

          <div class="flex space-x-3 pt-4">
            <button 
              type="button"
              (click)="closePasswordResetModal()" 
              class="flex-1 px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button 
              type="submit"
              [disabled]="isLoading"
              class="flex-1 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all disabled:opacity-50">
              {{ isLoading ? 'Définition...' : 'Définir le mot de passe' }}
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
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span class="material-icons text-green-600 text-xl">lock</span>
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
              Un mot de passe temporaire a été généré pour <strong>{{ temporaryPasswordData.email }}</strong>
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

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div class="flex items-start space-x-2">
              <span class="material-icons text-blue-600 text-sm mt-0.5">info</span>
              <p class="text-sm text-blue-800">
                Utilisez ce mot de passe pour vous connecter. Vous devrez définir un nouveau mot de passe lors de votre première connexion.
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
              (click)="closeTemporaryPasswordDialog(); loginForm.email = temporaryPasswordData.email;" 
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Se connecter maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  selectedRole: 'ADMIN' | 'RECEPTIONNISTE' | null = null;
  isLoading = false;
  errorMessage = '';
  showForgotPasswordModal = false;
  forgotPasswordEmail = '';
  showPasswordResetModal = false;
  passwordResetUser: any = null;
  showTemporaryPasswordDialog = false;
  newPasswordForm = {
    password: '',
    confirmPassword: ''
  };

  // Dialogue de mot de passe temporaire
  temporaryPasswordData = {
    password: '',
    email: ''
  };

  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private apiService: ApiService
  ) {}

  selectRole(role: 'ADMIN' | 'RECEPTIONNISTE') {
    this.selectedRole = role;
    // Pré-remplir l'email selon le rôle
    this.loginForm.email = role === 'ADMIN' ? 'admin@guesthub.com' : 'reception@guesthub.com';
  }

  goBack() {
    this.selectedRole = null;
    this.errorMessage = '';
    this.loginForm = { email: '', password: '', rememberMe: false };
  }


      forgotPassword() {
        this.showForgotPasswordModal = true;
        this.forgotPasswordEmail = this.loginForm.email;
      }

      closeForgotPasswordModal() {
        this.showForgotPasswordModal = false;
        this.forgotPasswordEmail = '';
      }

      async submitForgotPassword() {
        if (!this.forgotPasswordEmail) {
          this.toastService.warning(
            'Email requis',
            'Veuillez saisir votre adresse email.'
          );
          return;
        }

        this.isLoading = true;
        
        try {
          // Appel API pour la réinitialisation de mot de passe
          this.apiService.forgotPassword(this.forgotPasswordEmail).subscribe({
            next: (response: any) => {
              if (response.success) {
                const tempPassword = response.data?.tempPassword;
                if (tempPassword) {
                  // Afficher le mot de passe temporaire
                  this.toastService.success(
                    'Mot de passe temporaire généré',
                    `Mot de passe temporaire: ${tempPassword}. Vous devrez définir un nouveau mot de passe lors de votre prochaine connexion.`,
                    10000
                  );
                  
                  // Afficher le mot de passe temporaire dans un dialogue élégant
                  this.openTemporaryPasswordDialog(tempPassword, this.forgotPasswordEmail);
                } else {
                  this.toastService.success(
                    'Email envoyé',
                    `Un email de réinitialisation a été envoyé à ${this.forgotPasswordEmail}. Veuillez vérifier votre boîte de réception.`,
                    6000
                  );
                }
                this.closeForgotPasswordModal();
              } else {
                this.toastService.error('Erreur', response.message || 'Erreur lors de l\'envoi de l\'email');
              }
              this.isLoading = false;
            },
            error: (error: any) => {
              console.error('Error sending forgot password email:', error);
              this.toastService.error('Erreur', 'Erreur lors de l\'envoi de l\'email de réinitialisation');
              this.isLoading = false;
            }
          });
        } catch (error) {
          this.toastService.error('Erreur', 'Erreur lors de l\'envoi de l\'email de réinitialisation');
          this.isLoading = false;
        }
      }

      async login() {
    if (!this.selectedRole) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Utiliser l'API réelle
      this.authService.login({
        email: this.loginForm.email,
        password: this.loginForm.password
      }).subscribe({
        next: (response) => {
          console.log('Login response:', response); // Debug log
          if (response.success) {
            // Check if password reset is required
            if (response.data.passwordResetRequired) {
              console.log('Password reset required, showing modal'); // Debug log
              this.passwordResetUser = response.data.user;
              this.showPasswordResetModal = true;
              this.isLoading = false;
              return;
            }
            this.showWelcomeToast(response.data.user);
          } else {
            this.errorMessage = response.message || 'Email ou mot de passe incorrect';
            this.toastService.error(
              'Échec de la connexion',
              this.errorMessage
            );
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          
          let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
          let errorTitle = 'Erreur de connexion';
          
          if (error.status === 401) {
            errorMessage = error.error?.error || 'Email ou mot de passe incorrect';
            errorTitle = 'Connexion échouée';
          } else if (error.status === 429) {
            errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
            errorTitle = 'Trop de tentatives';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet';
            errorTitle = 'Erreur de connexion';
          }
          
          this.errorMessage = errorMessage;
          this.toastService.error(errorTitle, errorMessage);
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
      this.toastService.error(
        'Erreur de connexion',
        'Une erreur est survenue. Veuillez réessayer.'
      );
      this.isLoading = false;
    }
  }


      private showWelcomeToast(user: any): void {
        const now = new Date();
        
        let message = `Bienvenue ${user.firstName} ${user.lastName} !`;
        message += `\nRôle: ${user.role}`;
        
        this.toastService.success(
          'Connexion réussie',
          message,
          5000
        );
      }

      // Password reset methods
      setNewPassword() {
        if (this.newPasswordForm.password !== this.newPasswordForm.confirmPassword) {
          this.toastService.error('Erreur', 'Les mots de passe ne correspondent pas');
          return;
        }

        if (this.newPasswordForm.password.length < 8) {
          this.toastService.error('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
          return;
        }

        this.isLoading = true;

        this.apiService.setNewPassword(this.passwordResetUser.id, this.newPasswordForm.password).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Succès', 'Nouveau mot de passe défini avec succès');
              this.closePasswordResetModal();
              // Retry login with new password
              this.loginForm.password = this.newPasswordForm.password;
              this.login();
            } else {
              this.toastService.error('Erreur', response.message || 'Erreur lors de la définition du nouveau mot de passe');
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error setting new password:', error);
            this.toastService.error('Erreur', 'Une erreur est survenue lors de la définition du nouveau mot de passe');
            this.isLoading = false;
          }
        });
      }

  closePasswordResetModal() {
    this.showPasswordResetModal = false;
    this.passwordResetUser = null;
    this.newPasswordForm = {
      password: '',
      confirmPassword: ''
    };
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