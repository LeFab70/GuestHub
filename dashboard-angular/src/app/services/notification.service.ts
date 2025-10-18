import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'visit_created' | 'visit_updated' | 'visit_expired' | 'visit_completed';
  title: string;
  message: string;
  count: number;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: {
    badgeId?: string;
    visitorName?: string;
    employeeName?: string;
    departmentName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Charger les notifications depuis le localStorage au démarrage
    this.loadNotificationsFromStorage();
    
    // Nettoyer automatiquement les notifications des badges imprimés au démarrage
    this.cleanPrintedBadgeNotifications();
  }

  private loadNotificationsFromStorage(): void {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        // Error loading notifications from storage
      }
    }
  }

  private saveNotificationsToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notificationsSubject.value));
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    // Vérifier si une notification similaire existe déjà
    const existingNotification = this.notificationsSubject.value.find(n => 
      n.type === notification.type && 
      n.data?.badgeId === notification.data?.badgeId
    );

    if (existingNotification) {
      // Mettre à jour le compteur de la notification existante
      existingNotification.count += notification.count || 1;
      this.notificationsSubject.next([...this.notificationsSubject.value]);
      this.saveNotificationsToStorage();
      this.updateUnreadCount();
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications].slice(0, 50); // Garder seulement les 50 dernières
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  // Nettoyer les notifications pour les badges déjà imprimés
  cleanPrintedBadgeNotifications(): void {
    const notifications = this.notificationsSubject.value.filter(n => 
      !(n.type === 'visit_created' && n.data?.badgeId)
    );
    this.notificationsSubject.next(notifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  // Supprimer les notifications pour un badge spécifique
  removeNotificationsForBadge(badgeId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => 
      !(n.type === 'visit_created' && n.data?.badgeId === badgeId)
    );
    this.notificationsSubject.next(notifications);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  // Simuler une nouvelle visite créée (pour les tests)
  simulateNewVisit(): void {
    this.addNotification({
      type: 'visit_created',
      title: 'Nouvelle visite créée',
      message: 'Un visiteur a créé une nouvelle visite via l\'application mobile',
      count: 1,
      actionUrl: '/badges'
    });
  }

  // Méthode pour déclencher une notification de test
  triggerTestNotification(): void {
    this.addNotification({
      type: 'visit_created',
      title: 'Test de notification',
      message: 'Ceci est une notification de test pour vérifier le système',
      count: 1,
      actionUrl: '/badges'
    });
  }

  private generateId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
