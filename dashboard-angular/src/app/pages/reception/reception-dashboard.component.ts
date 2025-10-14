import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MainLayoutComponent } from '../../components/layout/main-layout.component';
import { VisitListComponent } from '../../components/visits/visit-list.component';
import { VisitorListComponent } from '../../components/visitors/visitor-list.component';
import { BadgeListComponent } from '../../components/badges/badge-list.component';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';
import { NavigationService } from '../../services/navigation.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, VisitListComponent, VisitorListComponent, BadgeListComponent, QrScannerComponent],
  template: `
    <app-main-layout>
      <!-- Vue d'ensemble -->
      <div *ngIf="activeTab === 'overview'" class="min-h-full flex flex-col space-y-6">
        <!-- Actions rapides -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-md border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center">
              <div class="p-5 rounded-full bg-sky-100 text-sky-600">
                <span class="material-icons text-4xl">check_circle</span>
              </div>
              <div class="ml-6 flex-1">
                <h4 class="text-xl font-semibold text-sky-900 mb-2">Check-in Visite Planifiée</h4>
                <p class="text-base text-sky-700 mb-6">Valider une visite prévue par un administrateur</p>
                <button (click)="activeTab = 'visits'" 
                        class="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-150 text-base font-medium">
                  Valider Visite
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center">
              <div class="p-5 rounded-full bg-gray-100 text-gray-600">
                <span class="material-icons text-4xl">add_circle</span>
              </div>
              <div class="ml-6 flex-1">
                <h4 class="text-xl font-semibold text-gray-900 mb-2">Nouvelle Visite</h4>
                <p class="text-base text-gray-700 mb-6">Créer une nouvelle visite pour un visiteur</p>
                <button (click)="activeTab = 'visits'" 
                        class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-150 text-base font-medium">
                  Créer Visite
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visits')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <span class="material-icons text-4xl">event</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Visites Aujourd'hui</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">12</p>
              <p class="text-sm text-blue-600 mb-4">3 en attente</p>
              <div class="flex items-center text-blue-600 text-base font-medium group-hover:text-blue-700">
                <span>Voir toutes</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visitors')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <span class="material-icons text-4xl">person</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-600 hover:text-green-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Visiteurs Actifs</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">8</p>
              <p class="text-sm text-green-600 mb-4">+2 aujourd'hui</p>
              <div class="flex items-center text-green-600 text-base font-medium group-hover:text-green-700">
                <span>Voir tous</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('badges')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <span class="material-icons text-4xl">badge</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-600 hover:text-yellow-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Badges à Imprimer</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">3</p>
              <p class="text-sm text-yellow-600 mb-4">Urgent</p>
              <div class="flex items-center text-yellow-600 text-base font-medium group-hover:text-yellow-700">
                <span>Voir tous</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" (click)="setActiveTab('visits')">
            <div class="flex items-center justify-between mb-6">
              <div class="p-5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <span class="material-icons text-4xl">exit_to_app</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-600 hover:text-purple-700">
                <span class="material-icons text-xl">arrow_forward</span>
              </button>
            </div>
            <div>
              <p class="text-base font-medium text-gray-600 mb-2">Check-outs En Attente</p>
              <p class="text-4xl font-bold text-gray-900 mb-3">2</p>
              <p class="text-sm text-purple-600 mb-4">À traiter</p>
              <div class="flex items-center text-purple-600 text-base font-medium group-hover:text-purple-700">
                <span>Voir toutes</span>
                <span class="material-icons text-base ml-2">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scanner QR Code -->
        <div class="mb-8">
          <app-qr-scanner></app-qr-scanner>
        </div>

        <!-- Visites récentes -->
        <div class="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md border border-blue-200 overflow-hidden">
          <h3 class="text-xl font-semibold text-blue-900 mb-6">Visites Récentes</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">JD</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Jean Dupont</p>
                  <p class="text-xs text-gray-500">Arrivé à 09:30 - Département IT</p>
                </div>
              </div>
              <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">En cours</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-green-600">MS</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Marie Smith</p>
                  <p class="text-xs text-gray-500">Arrivé à 10:15 - Département RH</p>
                </div>
              </div>
              <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Terminée</span>
            </div>
            <div class="flex items-center justify-between py-3">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-yellow-600">PL</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Pierre Laurent</p>
                  <p class="text-xs text-gray-500">Arrivé à 11:00 - Département Marketing</p>
                </div>
              </div>
              <span class="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">En attente</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Visites -->
      <div *ngIf="activeTab === 'visits'" class="min-h-full">
        <app-visit-list></app-visit-list>
      </div>

      <!-- Visiteurs -->
      <div *ngIf="activeTab === 'visitors'" class="min-h-full">
        <app-visitor-list></app-visitor-list>
      </div>

          <!-- Badges -->
          <div *ngIf="activeTab === 'badges'" class="min-h-full">
            <app-badge-list></app-badge-list>
          </div>

          <!-- Scanner QR -->
          <div *ngIf="activeTab === 'qr-scanner'" class="min-h-full">
            <app-qr-scanner></app-qr-scanner>
          </div>
        </app-main-layout>
  `,
})
export class ReceptionDashboardComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  private navigationSubscription: Subscription = new Subscription();
  private welcomeShown = false;

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // S'assurer que la vue d'ensemble est affichée par défaut
    this.activeTab = 'overview';
    this.navigationService.setActiveTab('overview');

    // Écouter les changements de navigation depuis le menu
    this.navigationSubscription = this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });

    // Afficher le toast de bienvenue si c'est la première fois
    this.showWelcomeToastIfNeeded();
  }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }

  // Méthode pour changer d'onglet depuis le menu
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  private showWelcomeToastIfNeeded(): void {
    if (this.welcomeShown) return;
    
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Vérifier si c'est une nouvelle session (pas de lastLogin dans localStorage)
    const sessionKey = `welcome_shown_${user.id}`;
    const hasShownWelcome = localStorage.getItem(sessionKey);
    
    if (!hasShownWelcome) {
      this.showWelcomeToast(user);
      localStorage.setItem(sessionKey, 'true');
      this.welcomeShown = true;
    }
  }

  private showWelcomeToast(user: User): void {
    const now = new Date();
    const lastLogin = user.previousLogin ? new Date(user.previousLogin) : null;
    
    let message = `Bienvenue ${user.prenom} ${user.nom} !`;
    
    if (lastLogin) {
      const timeDiff = now.getTime() - lastLogin.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      
      let timeAgo = '';
      if (daysDiff > 0) {
        timeAgo = `il y a ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`;
      } else if (hoursDiff > 0) {
        timeAgo = `il y a ${hoursDiff} heure${hoursDiff > 1 ? 's' : ''}`;
      } else if (minutesDiff > 0) {
        timeAgo = `il y a ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
      } else {
        timeAgo = 'à l\'instant';
      }
      
      message += `\nDernière connexion : ${timeAgo}`;
    } else {
      message += '\nPremière connexion !';
    }
    
    this.toastService.success(
      'Connexion réussie',
      message,
      8000 // 8 secondes pour laisser le temps de lire
    );
  }
}


