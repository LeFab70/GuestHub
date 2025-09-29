import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Visit, VisitStatus } from '../../models/visit.model';
import { VisitService } from '../../services/visit.service';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    RouterModule,
    FormsModule
  ],
  template: `
    <div class="visit-list-container">
      <div class="header">
        <h1>Visits Management</h1>
        <button mat-raised-button color="primary" routerLink="/visits/new">
          <mat-icon>event</mat-icon>
          Schedule New Visit
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filter-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search visits</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search by guest name or purpose">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onStatusFilter()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option *ngFor="let status of visitStatuses" [value]="status">
                  {{ status | titlecase }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-buttons">
              <button mat-button [class.active]="filterType === 'all'" (click)="filterByType('all')">
                All Visits
              </button>
              <button mat-button [class.active]="filterType === 'today'" (click)="filterByType('today')">
                Today
              </button>
              <button mat-button [class.active]="filterType === 'upcoming'" (click)="filterByType('upcoming')">
                Upcoming
              </button>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="visits$" class="visits-table">
              <!-- Guest Column -->
              <ng-container matColumnDef="guest">
                <th mat-header-cell *matHeaderCellDef>Guest</th>
                <td mat-cell *matCellDef="let visit">
                  <div class="guest-info">
                    <strong>{{ visit.guestName }}</strong>
                    <div class="visit-purpose">{{ visit.purpose }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Host Column -->
              <ng-container matColumnDef="host">
                <th mat-header-cell *matHeaderCellDef>Host</th>
                <td mat-cell *matCellDef="let visit">
                  {{ visit.hostName }}
                </td>
              </ng-container>

              <!-- Date & Time Column -->
              <ng-container matColumnDef="datetime">
                <th mat-header-cell *matHeaderCellDef>Date & Time</th>
                <td mat-cell *matCellDef="let visit">
                  <div class="datetime-info">
                    <div>{{ visit.visitDate | date:'MMM dd, yyyy' }}</div>
                    <div class="time">{{ visit.visitDate | date:'HH:mm' }}</div>
                    <div *ngIf="visit.expectedDuration" class="duration">
                      {{ visit.expectedDuration }} min
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let visit">
                  <mat-chip-set>
                    <mat-chip [ngClass]="'status-' + visit.visitStatus.toLowerCase().replace('_', '-')">
                      {{ visit.visitStatus | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Check-in/out Column -->
              <ng-container matColumnDef="checkinout">
                <th mat-header-cell *matHeaderCellDef>Check-in/out</th>
                <td mat-cell *matCellDef="let visit">
                  <div class="checkinout-info">
                    <div *ngIf="visit.checkInTime" class="checkin">
                      <mat-icon>login</mat-icon>
                      {{ visit.checkInTime | date:'HH:mm' }}
                    </div>
                    <div *ngIf="visit.checkOutTime" class="checkout">
                      <mat-icon>logout</mat-icon>
                      {{ visit.checkOutTime | date:'HH:mm' }}
                    </div>
                    <div *ngIf="visit.actualDuration && visit.checkOutTime" class="duration">
                      {{ visit.actualDuration }} min
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let visit">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            *ngIf="visit.visitStatus === 'SCHEDULED' || visit.visitStatus === 'IN_PROGRESS'"
                            (click)="checkIn(visit)"
                            [disabled]="visit.visitStatus === 'IN_PROGRESS'"
                            matTooltip="Check In">
                      <mat-icon>login</mat-icon>
                    </button>
                    <button mat-icon-button 
                            *ngIf="visit.visitStatus === 'IN_PROGRESS'"
                            (click)="checkOut(visit)"
                            matTooltip="Check Out">
                      <mat-icon>logout</mat-icon>
                    </button>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item routerLink="/visits/edit/{{ visit.id }}">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item 
                              *ngIf="visit.visitStatus === 'SCHEDULED'"
                              (click)="cancelVisit(visit)">
                        <mat-icon>cancel</mat-icon>
                        <span>Cancel</span>
                      </button>
                      <button mat-menu-item 
                              *ngIf="visit.visitStatus === 'SCHEDULED'"
                              (click)="markNoShow(visit)">
                        <mat-icon>no_accounts</mat-icon>
                        <span>Mark No Show</span>
                      </button>
                      <button mat-menu-item (click)="deleteVisit(visit)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>
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
    .visit-list-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filter-section {
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

    .status-filter {
      min-width: 150px;
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

    .visits-table {
      width: 100%;
    }

    .guest-info strong {
      font-size: 1.1em;
    }

    .visit-purpose {
      color: #666;
      font-size: 0.9em;
    }

    .datetime-info {
      font-size: 0.9em;
    }

    .time {
      color: #666;
    }

    .duration {
      color: #999;
      font-size: 0.8em;
    }

    .checkinout-info {
      font-size: 0.9em;
    }

    .checkin, .checkout {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 2px;
    }

    .checkin mat-icon {
      color: #4caf50;
    }

    .checkout mat-icon {
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .delete-action {
      color: #d32f2f;
    }

    .delete-action mat-icon {
      color: #d32f2f;
    }
  `]
})
export class VisitListComponent implements OnInit {
  visits$: Observable<Visit[]>;
  searchTerm = '';
  selectedStatus = '';
  filterType = 'all';
  visitStatuses = Object.values(VisitStatus);

  displayedColumns: string[] = ['guest', 'host', 'datetime', 'status', 'checkinout', 'actions'];

  constructor(private visitService: VisitService) {
    this.visits$ = this.visitService.getAllVisits();
  }

  ngOnInit() {
    // Component initialization
  }

  onSearch() {
    // Implement search functionality
    this.visits$ = this.visitService.getAllVisits();
  }

  onStatusFilter() {
    if (this.selectedStatus) {
      this.visits$ = this.visitService.getVisitsByStatus(this.selectedStatus as VisitStatus);
    } else {
      this.visits$ = this.visitService.getAllVisits();
    }
  }

  filterByType(type: string) {
    this.filterType = type;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (type) {
      case 'today':
        this.visits$ = this.visitService.getVisitsByDateRange(startOfDay, endOfDay);
        break;
      case 'upcoming':
        this.visits$ = this.visitService.getVisitsByDateRange(today, nextWeek);
        break;
      default:
        this.visits$ = this.visitService.getAllVisits();
    }
  }

  checkIn(visit: Visit) {
    if (visit.id) {
      this.visitService.checkInVisit(visit.id).subscribe(updatedVisit => {
        if (updatedVisit) {
          this.visits$ = this.visitService.getAllVisits();
        }
      });
    }
  }

  checkOut(visit: Visit) {
    if (visit.id) {
      this.visitService.checkOutVisit(visit.id).subscribe(updatedVisit => {
        if (updatedVisit) {
          this.visits$ = this.visitService.getAllVisits();
        }
      });
    }
  }

  cancelVisit(visit: Visit) {
    if (visit.id && confirm('Are you sure you want to cancel this visit?')) {
      this.visitService.cancelVisit(visit.id).subscribe(updatedVisit => {
        if (updatedVisit) {
          this.visits$ = this.visitService.getAllVisits();
        }
      });
    }
  }

  markNoShow(visit: Visit) {
    if (visit.id && confirm('Mark this visit as no show?')) {
      this.visitService.markNoShow(visit.id).subscribe(updatedVisit => {
        if (updatedVisit) {
          this.visits$ = this.visitService.getAllVisits();
        }
      });
    }
  }

  deleteVisit(visit: Visit) {
    if (visit.id && confirm('Are you sure you want to delete this visit?')) {
      this.visitService.deleteVisit(visit.id).subscribe(success => {
        if (success) {
          this.visits$ = this.visitService.getAllVisits();
        }
      });
    }
  }
}
