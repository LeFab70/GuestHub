import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        *ngFor="let toast of toasts" 
        [class]="getToastClasses(toast.type)"
        class="min-w-80 max-w-md w-auto bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
        [style.transform]="toast.show ? 'translateX(0)' : 'translateX(100%)'"
        [style.opacity]="toast.show ? '1' : '0'">
        
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="material-icons text-lg" [class]="getIconClasses(toast.type)">
                {{ getIcon(toast.type) }}
              </span>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 break-words">
                {{ toast.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500 break-words">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button 
                (click)="removeToast(toast.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span class="sr-only">Fermer</span>
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar -->
        <div class="h-1 bg-gray-200">
          <div 
            class="h-full transition-all duration-100 ease-linear"
            [class]="getProgressBarClasses(toast.type)"
            [style.width.%]="progressWidth"
            [style.animation]="'progress ' + (toast.duration || 5000) + 'ms linear'">
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    </style>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-400 bg-green-50`;
      case 'error':
        return `${baseClasses} border-red-400 bg-red-50`;
      case 'warning':
        return `${baseClasses} border-yellow-400 bg-yellow-50`;
      case 'info':
        return `${baseClasses} border-blue-400 bg-blue-50`;
      default:
        return `${baseClasses} border-gray-400 bg-gray-50`;
    }
  }

  getIconClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getProgressBarClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  }

  get progressWidth(): number {
    return 100;
  }
}
