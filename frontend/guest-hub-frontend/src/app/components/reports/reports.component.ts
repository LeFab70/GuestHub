import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Visit, VisitStatus } from '../../models/visit.model';
import { Guest } from '../../models/guest.model';
import { User } from '../../models/user.model';
import { VisitService } from '../../services/visit.service';
import { GuestService } from '../../services/guest.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="reports-container">
      <h1>Reports & Analytics</h1>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-content">
              <mat-icon class="card-icon">event</mat-icon>
              <div class="card-text">
                <h2>{{ totalVisits }}</h2>
                <p>Total Visits</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-content">
              <mat-icon class="card-icon">check_circle</mat-icon>
              <div class="card-text">
                <h2>{{ completedVisits }}</h2>
                <p>Completed</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-content">
              <mat-icon class="card-icon">schedule</mat-icon>
              <div class="card-text">
                <h2>{{ scheduledVisits }}</h2>
                <p>Scheduled</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-content">
              <mat-icon class="card-icon">people</mat-icon>
              <div class="card-text">
                <h2>{{ totalGuests }}</h2>
                <p>Unique Guests</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <h3>Filter Reports</h3>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-select [(ngModel)]="selectedDateRange" (selectionChange)="onDateRangeChange()">
                <mat-option value="today">Today</mat-option>
                <mat-option value="week">This Week</mat-option>
                <mat-option value="month">This Month</mat-option>
                <mat-option value="custom">Custom Range</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="onCustomDateChange()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="onCustomDateChange()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onStatusChange()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option *ngFor="let status of visitStatuses" [value]="status">
                  {{ status | titlecase }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="generateReport()">
              <mat-icon>refresh</mat-icon>
              Generate Report
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Visit Statistics Table -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Visit Statistics</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredVisits$" class="reports-table">
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

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let visit">
                  {{ visit.visitDate | date:'MMM dd, yyyy HH:mm' }}
                </td>
              </ng-container>

              <!-- Duration Column -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef>Duration</th>
                <td mat-cell *matCellDef="let visit">
                  <div *ngIf="visit.actualDuration; else expectedDuration">
                    {{ visit.actualDuration }} min
                  </div>
                  <ng-template #expectedDuration>
                    {{ visit.expectedDuration || '-' }} min
                  </ng-template>
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

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Status Distribution -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Status Distribution</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="status-distribution">
            <div class="status-item" *ngFor="let status of statusDistribution">
              <div class="status-info">
                <mat-chip [ngClass]="'status-' + status.status.toLowerCase().replace('_', '-')">
                  {{ status.status | titlecase }}
                </mat-chip>
                <span class="status-count">{{ status.count }} visits</span>
              </div>
              <div class="status-bar">
                <div class="status-fill" [style.width.%]="status.percentage"></div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      text-align: center;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .card-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .card-text h2 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 300;
    }

    .card-text p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 1.1em;
    }

    .filters-card {
      margin-bottom: 30px;
    }

    .filters {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 150px;
    }

    .filters button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-container {
      overflow-x: auto;
    }

    .reports-table {
      width: 100%;
    }

    .guest-info strong {
      font-size: 1.1em;
    }

    .visit-purpose {
      color: #666;
      font-size: 0.9em;
    }

    .status-distribution {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-count {
      font-weight: 500;
      color: #666;
    }

    .status-bar {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .status-fill {
      height: 100%;
      background-color: #1976d2;
      transition: width 0.3s ease;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .filters mat-form-field {
        min-width: auto;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  filteredVisits$: Observable<Visit[]>;
  totalVisits = 0;
  completedVisits = 0;
  scheduledVisits = 0;
  totalGuests = 0;
  selectedDateRange = 'month';
  selectedStatus = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  visitStatuses = Object.values(VisitStatus);
  statusDistribution: any[] = [];

  displayedColumns: string[] = ['guest', 'host', 'date', 'duration', 'status'];

  constructor(
    private visitService: VisitService,
    private guestService: GuestService,
    private userService: UserService
  ) {
    this.filteredVisits$ = this.visitService.getAllVisits();
  }

  ngOnInit() {
    this.loadReportData();
  }

  onDateRangeChange() {
    this.generateReport();
  }

  onCustomDateChange() {
    if (this.startDate && this.endDate) {
      this.generateReport();
    }
  }

  onStatusChange() {
    this.generateReport();
  }

  generateReport() {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'custom':
        if (this.startDate && this.endDate) {
          startDate = this.startDate;
          endDate = this.endDate;
        } else {
          return;
        }
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    if (this.selectedStatus) {
      this.filteredVisits$ = this.visitService.getVisitsByStatus(this.selectedStatus as VisitStatus);
    } else {
      this.filteredVisits$ = this.visitService.getVisitsByDateRange(startDate, endDate);
    }

    this.loadReportData();
  }

  private loadReportData() {
    this.visitService.getAllVisits().subscribe(visits => {
      this.totalVisits = visits.length;
      this.completedVisits = visits.filter(v => v.visitStatus === VisitStatus.COMPLETED).length;
      this.scheduledVisits = visits.filter(v => v.visitStatus === VisitStatus.SCHEDULED).length;
      
      // Calculate status distribution
      const statusCounts = visits.reduce((acc, visit) => {
        acc[visit.visitStatus] = (acc[visit.visitStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      this.statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / this.totalVisits) * 100
      }));
    });

    this.guestService.getAllGuests().subscribe(guests => {
      this.totalGuests = guests.length;
    });
  }
}
