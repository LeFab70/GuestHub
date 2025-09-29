import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Guest, IdType } from '../../models/guest.model';
import { GuestService } from '../../services/guest.service';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    RouterModule,
    FormsModule
  ],
  template: `
    <div class="guest-list-container">
      <div class="header">
        <h1>Guests Management</h1>
        <button mat-raised-button color="primary" routerLink="/guests/new">
          <mat-icon>person_add</mat-icon>
          Add New Guest
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search guests</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search by name, email, or company">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <div class="filter-buttons">
              <button mat-button [class.active]="filterType === 'all'" (click)="filterByType('all')">
                All ({{ totalGuests }})
              </button>
              <button mat-button [class.active]="filterType === 'active'" (click)="filterByType('active')">
                Active ({{ activeGuests }})
              </button>
              <button mat-button [class.active]="filterType === 'blacklisted'" (click)="filterByType('blacklisted')">
                Blacklisted ({{ blacklistedGuests }})
              </button>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="guests$" class="guests-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let guest">
                  <div class="guest-name">
                    <strong>{{ guest.firstName }} {{ guest.lastName }}</strong>
                    <div class="guest-email">{{ guest.email }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Company Column -->
              <ng-container matColumnDef="company">
                <th mat-header-cell *matHeaderCellDef>Company</th>
                <td mat-cell *matCellDef="let guest">
                  <div *ngIf="guest.company; else noCompany">
                    {{ guest.company }}
                    <div class="guest-position" *ngIf="guest.position">{{ guest.position }}</div>
                  </div>
                  <ng-template #noCompany>
                    <span class="no-data">-</span>
                  </ng-template>
                </td>
              </ng-container>

              <!-- Contact Column -->
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let guest">
                  <div class="contact-info">
                    <div>{{ guest.phoneNumber }}</div>
                    <div *ngIf="guest.idNumber" class="id-info">
                      {{ guest.idType }}: {{ guest.idNumber }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let guest">
                  <mat-chip-set>
                    <mat-chip [class.blacklisted]="guest.isBlacklisted" [class.active]="!guest.isBlacklisted">
                      {{ guest.isBlacklisted ? 'Blacklisted' : 'Active' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let guest">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item routerLink="/guests/edit/{{ guest.id }}">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="toggleBlacklist(guest)">
                      <mat-icon>{{ guest.isBlacklisted ? 'person_add' : 'block' }}</mat-icon>
                      <span>{{ guest.isBlacklisted ? 'Unblacklist' : 'Blacklist' }}</span>
                    </button>
                    <button mat-menu-item (click)="deleteGuest(guest)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .guest-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .search-section {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
    }

    .filter-buttons button.active {
      background-color: #1976d2;
      color: white;
    }

    .table-container {
      overflow-x: auto;
    }

    .guests-table {
      width: 100%;
    }

    .guest-name strong {
      font-size: 1.1em;
    }

    .guest-email {
      color: #666;
      font-size: 0.9em;
    }

    .guest-position {
      color: #666;
      font-size: 0.9em;
    }

    .contact-info {
      font-size: 0.9em;
    }

    .id-info {
      color: #666;
      font-size: 0.8em;
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    .blacklisted {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }

    .active {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .delete-action {
      color: #d32f2f;
    }

    .delete-action mat-icon {
      color: #d32f2f;
    }
  `]
})
export class GuestListComponent implements OnInit {
  guests$: Observable<Guest[]>;
  searchTerm = '';
  filterType = 'all';
  totalGuests = 0;
  activeGuests = 0;
  blacklistedGuests = 0;

  displayedColumns: string[] = ['name', 'company', 'contact', 'status', 'actions'];

  constructor(private guestService: GuestService) {
    this.guests$ = this.guestService.getAllGuests();
  }

  ngOnInit() {
    this.loadGuestStats();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.guests$ = this.guestService.searchGuests(this.searchTerm);
    } else {
      this.guests$ = this.guestService.getAllGuests();
    }
  }

  filterByType(type: string) {
    this.filterType = type;
    switch (type) {
      case 'active':
        this.guests$ = this.guestService.getNotBlacklistedGuests();
        break;
      case 'blacklisted':
        this.guests$ = this.guestService.getBlacklistedGuests();
        break;
      default:
        this.guests$ = this.guestService.getAllGuests();
    }
  }

  toggleBlacklist(guest: Guest) {
    if (guest.id) {
      if (guest.isBlacklisted) {
        this.guestService.unblacklistGuest(guest.id).subscribe((updatedGuest: Guest | undefined) => {
          if (updatedGuest) {
            this.loadGuestStats();
            this.filterByType(this.filterType);
          }
        });
      } else {
        this.guestService.blacklistGuest(guest.id).subscribe((updatedGuest: Guest | undefined) => {
          if (updatedGuest) {
            this.loadGuestStats();
            this.filterByType(this.filterType);
          }
        });
      }
    }
  }

  deleteGuest(guest: Guest) {
    if (guest.id && confirm('Are you sure you want to delete this guest?')) {
      this.guestService.deleteGuest(guest.id).subscribe((success: boolean) => {
        if (success) {
          this.loadGuestStats();
          this.filterByType(this.filterType);
        }
      });
    }
  }

  private loadGuestStats() {
    this.guestService.getAllGuests().subscribe((guests: Guest[]) => {
      this.totalGuests = guests.length;
      this.activeGuests = guests.filter((g: Guest) => !g.isBlacklisted).length;
      this.blacklistedGuests = guests.filter((g: Guest) => g.isBlacklisted).length;
    });
  }
}
