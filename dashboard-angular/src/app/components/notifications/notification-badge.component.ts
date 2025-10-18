import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';
import { BadgePreviewService } from '../../services/badge-preview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50">
      <!-- Badge de notification -->
      <div 
        [class]="'notification-badge ' + (hasNewNotifications ? 'new-notification' : '') + ' bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-600 transition-colors'"
        (click)="toggleNotifications()"
        title="Notifications"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 5h5V1h-5v4zM4 12h6V8H4v4zM15 12h5V8h-5v4z"></path>
        </svg>
        <span 
          *ngIf="unreadCount > 0"
          class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </div>

      <!-- Panel des notifications -->
      <div 
        *ngIf="showNotifications" 
        class="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Notifications</h3>
            <div class="flex space-x-2">
              <button 
                *ngIf="unreadCount > 0"
                (click)="markAllAsRead()"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                Tout marquer comme lu
              </button>
              <button 
                (click)="closeNotifications()"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des notifications -->
        <div class="max-h-64 overflow-y-auto">
          <div 
            *ngFor="let notification of notifications; trackBy: trackByNotificationId"
            class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            [class.bg-blue-50]="!notification.read"
            (click)="handleNotificationClick(notification)"
          >
            <div class="flex items-start space-x-3">
              <!-- Icône -->
              <div class="flex-shrink-0">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  [class]="getNotificationIconClass(notification.type)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      *ngIf="notification.type === 'visit_created'" 
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                    <path 
                      *ngIf="notification.type === 'visit_updated'" 
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                    <path 
                      *ngIf="notification.type === 'visit_expired'" 
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatTime(notification.timestamp) }}</p>
              </div>

              <!-- Indicateur non lu -->
              <div *ngIf="!notification.read" class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Message vide -->
          <div *ngIf="notifications.length === 0" class="p-4 text-center text-gray-500">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 5h5V1h-5v4zM4 12h6V8H4v4zM15 12h5V8h-5v4z"></path>
            </svg>
            <p class="text-sm">Aucune notification</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-enter {
      animation: slideInUp 0.3s ease-out;
    }
    
    .notification-badge {
      animation: pulseGlow 2s ease-in-out infinite;
    }
    
    .notification-badge.new-notification {
      animation: blinkPulse 1.5s ease-in-out infinite;
    }
    
    @keyframes slideInUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        transform: scale(1.05);
      }
    }
    
    @keyframes blinkPulse {
      0%, 100% {
        background-color: #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        transform: scale(1);
      }
      25% {
        background-color: #dc2626;
        box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
        transform: scale(1.1);
      }
      50% {
        background-color: #ef4444;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
        transform: scale(1.05);
      }
      75% {
        background-color: #dc2626;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.7);
        transform: scale(1.08);
      }
    }
    
    .notification-badge:hover {
      animation: none;
      background-color: #dc2626;
      transform: scale(1.1);
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
    }
  `]
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  hasNewNotifications = false;
  private lastNotificationCount = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private badgePreviewService: BadgePreviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // S'abonner aux notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    // S'abonner au compteur de notifications non lues
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        // Détecter les nouvelles notifications
        if (count > this.lastNotificationCount) {
          this.hasNewNotifications = true;
          // Arrêter l'animation après 10 secondes
          setTimeout(() => {
            this.hasNewNotifications = false;
          }, 10000);
        }
        this.unreadCount = count;
        this.lastNotificationCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    // Arrêter l'animation de clignotement quand l'utilisateur clique
    this.hasNewNotifications = false;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  handleNotificationClick(notification: Notification): void {
    try {
      // Marquer comme lu
      this.notificationService.markAsRead(notification.id);
      
      // Fermer le panel
      this.closeNotifications();
      
      // Rediriger vers l'aperçu du badge si c'est une notification de visite
      if (notification.type === 'visit_created' && notification.data?.badgeId) {
        const badgeId = notification.data?.badgeId;
        if (badgeId) {
          
          // Utiliser directement le service de prévisualisation des badges
          // qui gère l'authentification et la récupération des données
          this.badgePreviewService.openBadgePreview(badgeId);
        } else {
          console.error('❌ BadgeId manquant dans la notification');
        }
      } else if (notification.actionUrl) {
        setTimeout(() => {
          this.router.navigate([notification.actionUrl]);
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors du clic sur la notification:', error);
    }
  }


  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'visit_created':
        return 'bg-green-100 text-green-600';
      case 'visit_updated':
        return 'bg-blue-100 text-blue-600';
      case 'visit_expired':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR');
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
