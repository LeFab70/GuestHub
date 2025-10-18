import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage <= 1"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Précédent
        </button>
        <button 
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage >= totalPages"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Affichage de 
            <span class="font-medium">{{ ((currentPage - 1) * pageSize) + 1 }}</span>
            à 
            <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
            sur 
            <span class="font-medium">{{ totalItems }}</span>
            résultats
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <!-- Bouton Précédent -->
            <button 
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage <= 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Précédent</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Numéros de page -->
            <ng-container *ngFor="let page of getVisiblePages()">
              <button 
                *ngIf="page !== '...'"
                (click)="goToPageNumber(page)"
                [class]="page === currentPage ? 
                  'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' :
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'">
                {{ page }}
              </button>
              <span 
                *ngIf="page === '...'"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                ...
              </span>
            </ng-container>
            
            <!-- Bouton Suivant -->
            <button 
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage >= totalPages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Suivant</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToPageNumber(page: string | number) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      // Afficher toutes les pages si le total est petit
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipses
      if (this.currentPage <= 3) {
        // Début de la liste
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Fin de la liste
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu de la liste
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
}
