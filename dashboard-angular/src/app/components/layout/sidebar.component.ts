import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full bg-gray-900 text-white">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <div *ngIf="!collapsed" class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span class="material-icons text-white">home</span>
          </div>
          <div>
            <h1 class="text-xl font-bold">GuestHub</h1>
            <p class="text-sm text-gray-400">{{ user?.role }}</p>
          </div>
        </div>
        <div *ngIf="collapsed" class="flex justify-center">
          <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span class="material-icons text-white">home</span>
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="p-4 border-b border-gray-700">
        <div *ngIf="!collapsed" class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium">{{ user?.prenom?.charAt(0) }}</span>
          </div>
          <div>
            <p class="text-sm font-medium">{{ user?.prenom }} {{ user?.nom }}</p>
            <p class="text-xs text-gray-400">{{ user?.email }}</p>
          </div>
        </div>
        <div *ngIf="collapsed" class="flex justify-center">
          <div class="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium">{{ user?.prenom?.charAt(0) }}</span>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="mt-4">
        <ul class="space-y-1 px-2">
          <li *ngFor="let item of menuItems">
            <button
              *ngIf="!item.children"
              (click)="onMenuClick(item)"
              [class]="isActive(item) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
              [title]="collapsed ? item.label : ''"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out">
              <span class="material-icons text-lg" [class]="collapsed ? '' : 'mr-3'">{{ item.icon }}</span>
              <span *ngIf="!collapsed">{{ item.label }}</span>
            </button>
            
            <!-- Submenu -->
            <div *ngIf="item.children && !collapsed" class="space-y-1">
              <button
                (click)="toggleSubmenu(item)"
                class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition duration-150 ease-in-out">
                <div class="flex items-center">
                  <span class="material-icons text-lg mr-3">{{ item.icon }}</span>
                  {{ item.label }}
                </div>
                <span class="material-icons text-sm transition-transform duration-200" [class.rotate-90]="expandedMenus[item.label]">chevron_right</span>
              </button>
              <div *ngIf="expandedMenus[item.label]" class="ml-6 space-y-1">
                <button
                  *ngFor="let child of item.children"
                  (click)="onMenuClick(child)"
                  [class]="isActive(child) ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'"
                  class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out">
                  <span class="material-icons text-sm mr-3">{{ child.icon }}</span>
                  {{ child.label }}
                </button>
              </div>
            </div>
            
            <!-- Submenu collapsed - show only first child as main button -->
            <button
              *ngIf="item.children && collapsed"
              (click)="onMenuClick(item.children[0])"
              [class]="isActive(item.children[0]) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
              [title]="item.children[0].label"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out">
              <span class="material-icons text-lg">{{ item.children[0].icon }}</span>
            </button>
          </li>
        </ul>
      </nav>

    </div>
  `
})
export class SidebarComponent {
  @Input() user: User | null = null;
  @Input() menuItems: MenuItem[] = [];
  @Input() collapsed: boolean = false;
  @Output() menuClick = new EventEmitter<MenuItem>();

  expandedMenus: { [key: string]: boolean } = {};

  onMenuClick(item: MenuItem) {
    this.menuClick.emit(item);
  }

  toggleSubmenu(item: MenuItem) {
    this.expandedMenus[item.label] = !this.expandedMenus[item.label];
  }

  isActive(item: MenuItem): boolean {
    // Logique pour déterminer si un élément de menu est actif
    return false;
  }

}
