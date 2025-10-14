import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toasts: ToastMessage[] = [];

  showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000): void {
    const id = Date.now().toString();
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      show: true
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clearAll(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }

  // Convenience methods
  success(title: string, message: string, duration?: number): void {
    this.showToast('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number): void {
    this.showToast('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): void {
    this.showToast('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): void {
    this.showToast('info', title, message, duration);
  }
}
