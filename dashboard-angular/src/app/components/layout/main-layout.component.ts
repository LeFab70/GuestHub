import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { SidebarComponent, MenuItem } from './sidebar.component';
import { UserProfileComponent } from '../profile/user-profile.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, UserProfileComponent],
  template: `
    <div class="h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <!-- Sidebar -->
      <div [class]="sidebarCollapsed ? 'w-16' : 'w-64'" class="flex-shrink-0 transition-all duration-300 ease-in-out">
        <app-sidebar 
          [user]="currentUser" 
          [menuItems]="menuItems"
          [collapsed]="sidebarCollapsed"
          (menuClick)="onMenuClick($event)">
        </app-sidebar>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-200">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <!-- Menu Toggle -->
                <button 
                  (click)="toggleSidebar()" 
                  class="p-2 text-white hover:text-blue-100 hover:bg-blue-500 rounded-lg transition-colors">
                  <span class="material-icons text-xl">
                    {{ sidebarCollapsed ? 'menu' : 'menu_open' }}
                  </span>
                </button>
                
                    <!-- Logo et titre -->
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <span class="material-icons text-blue-600 text-lg">{{ getPageIcon() }}</span>
                      </div>
                      <h1 class="text-xl font-bold text-white">{{ pageTitle }}</h1>
                    </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <!-- Notifications -->
                <button class="p-2 text-white hover:text-blue-100 relative">
                  <span class="material-icons text-xl">notifications</span>
                  <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>
                
                <!-- User Menu -->
                <div class="relative">
                  <button class="flex items-center space-x-2 text-sm text-white hover:text-blue-100">
                    <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-white">{{ currentUser?.prenom?.charAt(0) }}</span>
                    </div>
                    <span>{{ currentUser?.prenom }} {{ currentUser?.nom }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div class="w-full p-3 pb-8">
            <!-- Profil utilisateur -->
            <div *ngIf="currentView === 'profile'">
              <app-user-profile></app-user-profile>
            </div>
            
            <!-- Contenu principal -->
            <div *ngIf="currentView !== 'profile'">
              <ng-content></ng-content>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  pageTitle = 'Dashboard';
  currentView = 'dashboard';
  sidebarCollapsed = false;
  private userSubscription: Subscription = new Subscription();

  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.setupMenuItems(user.role);
        // S'assurer que la vue d'ensemble est affichée par défaut
        this.pageTitle = 'Vue d\'ensemble';
        this.currentView = 'overview';
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  setupMenuItems(role: 'ADMIN' | 'RECEPTIONNISTE' | 'USER') {
    if (role === 'ADMIN') {
      this.menuItems = [
        {
          label: 'Vue d\'ensemble',
          icon: 'dashboard',
          action: 'overview'
        },
        {
          label: 'Gestion',
          icon: 'settings',
          children: [
            {
              label: 'Utilisateurs',
              icon: 'people_alt',
              action: 'users'
            },
            {
              label: 'Employés',
              icon: 'people',
              action: 'employees'
            },
            {
              label: 'Départements',
              icon: 'business',
              action: 'departments'
            },
            {
              label: 'Visiteurs',
              icon: 'person',
              action: 'visitors'
            }
          ]
        },
        {
          label: 'Visites',
          icon: 'event',
          action: 'visits'
        },
        {
          label: 'Badges',
          icon: 'badge',
          action: 'badges'
        },
        {
          label: 'Rapports',
          icon: 'assessment',
          action: 'audit'
        },
        {
          label: 'Mon Profil',
          icon: 'account_circle',
          action: 'profile'
        },
        {
          label: 'Déconnexion',
          icon: 'logout',
          action: 'logout'
        }
      ];
        } else {
          this.menuItems = [
            {
              label: 'Vue d\'ensemble',
              icon: 'dashboard',
              action: 'overview'
            },
            {
              label: 'Scanner QR',
              icon: 'qr_code_scanner',
              action: 'qr-scanner'
            },
            {
              label: 'Visites',
              icon: 'event',
              action: 'visits'
            },
            {
              label: 'Visiteurs',
              icon: 'person',
              action: 'visitors'
            },
            {
              label: 'Badges',
              icon: 'badge',
              action: 'badges'
            },
            {
              label: 'Mon Profil',
              icon: 'account_circle',
              action: 'profile'
            },
            {
              label: 'Déconnexion',
              icon: 'logout',
              action: 'logout'
            }
          ];
        }
  }

  onMenuClick(item: MenuItem) {
    if (item.action) {
      if (item.action === 'logout') {
        this.logout();
        return;
      }
      
      this.pageTitle = item.label;
      this.currentView = item.action;
      
      // Notifier le service de navigation
      this.navigationService.setActiveTab(item.action);
      
      // Émettre un événement pour que les dashboards puissent réagir
      if (item.action === 'profile') {
        this.pageTitle = 'Mon Profil';
      }
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }

  getPageIcon(): string {
    switch (this.currentView) {
      case 'overview': return 'dashboard';
      case 'users': return 'people_alt';
      case 'employees': return 'people';
      case 'departments': return 'business';
      case 'visitors': return 'person';
      case 'visits': return 'event';
      case 'badges': return 'badge';
      case 'audit': return 'assessment';
      case 'qr-scanner': return 'qr_code_scanner';
      case 'profile': return 'account_circle';
      default: return 'home';
    }
  }
}
