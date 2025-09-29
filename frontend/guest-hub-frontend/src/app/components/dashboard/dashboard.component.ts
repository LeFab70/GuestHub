import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Guest } from '../../models/guest.model';
import { Visit, VisitStatus } from '../../models/visit.model';
import { UserService } from '../../services/user.service';
import { GuestService } from '../../services/guest.service';
import { VisitService } from '../../services/visit.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <mat-grid-list cols="4" rowHeight="200px" gutterSize="20px">
        <!-- Total Users Card -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon users">people</mat-icon>
                <div class="card-text">
                  <h2>{{ totalUsers }}</h2>
                  <p>Total Users</p>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/users">View All</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <!-- Total Guests Card -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon guests">person_add</mat-icon>
                <div class="card-text">
                  <h2>{{ totalGuests }}</h2>
                  <p>Total Guests</p>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/guests">View All</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <!-- Today's Visits Card -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon visits">event</mat-icon>
                <div class="card-text">
                  <h2>{{ todaysVisits }}</h2>
                  <p>Today's Visits</p>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/visits">View All</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <!-- Active Visits Card -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-content>
              <div class="card-content">
                <mat-icon class="card-icon active">schedule</mat-icon>
                <div class="card-text">
                  <h2>{{ activeVisits }}</h2>
                  <p>Active Visits</p>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/visits">View All</button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <!-- Recent Visits Section -->
      <div class="recent-section">
        <h2>Recent Visits</h2>
        <mat-card>
          <mat-card-content>
            <div class="visits-list" *ngIf="recentVisits$ | async as visits; else loading">
              <div class="visit-item" *ngFor="let visit of visits">
                <div class="visit-info">
                  <h3>{{ visit.guestName }}</h3>
                  <p>{{ visit.purpose }}</p>
                  <span class="visit-date">{{ visit.visitDate | date:'short' }}</span>
                </div>
                <div class="visit-status">
                  <span class="status-badge" [ngClass]="'status-' + visit.visitStatus.toLowerCase().replace('_', '-')">
                    {{ visit.visitStatus | titlecase }}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #loading>
              <div class="loading">Loading recent visits...</div>
            </ng-template>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/visits">View All Visits</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/guests/new">
            <mat-icon>person_add</mat-icon>
            Add New Guest
          </button>
          <button mat-raised-button color="accent" routerLink="/visits/new">
            <mat-icon>event</mat-icon>
            Schedule Visit
          </button>
          <button mat-raised-button routerLink="/users/new">
            <mat-icon>person_add</mat-icon>
            Add New User
          </button>
          <button mat-raised-button routerLink="/reports">
            <mat-icon>assessment</mat-icon>
            View Reports
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .dashboard-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 15px;
      height: 100%;
    }

    .card-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .card-icon.users {
      color: #1976d2;
    }

    .card-icon.guests {
      color: #388e3c;
    }

    .card-icon.visits {
      color: #f57c00;
    }

    .card-icon.active {
      color: #7b1fa2;
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

    .recent-section, .quick-actions {
      margin-top: 30px;
    }

    .visits-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .visit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }

    .visit-item:last-child {
      border-bottom: none;
    }

    .visit-info h3 {
      margin: 0 0 5px 0;
      font-size: 1.2em;
    }

    .visit-info p {
      margin: 0 0 5px 0;
      color: #666;
    }

    .visit-date {
      font-size: 0.9em;
      color: #999;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;
  totalGuests = 0;
  todaysVisits = 0;
  activeVisits = 0;
  recentVisits$: Observable<Visit[]>;

  constructor(
    private userService: UserService,
    private guestService: GuestService,
    private visitService: VisitService
  ) {
    this.recentVisits$ = this.visitService.getAllVisits();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load total users
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.totalUsers = users.length;
    });

    // Load total guests
    this.guestService.getAllGuests().subscribe((guests: Guest[]) => {
      this.totalGuests = guests.length;
    });

    // Load today's visits
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    this.visitService.getVisitsByDateRange(startOfDay, endOfDay).subscribe((visits: Visit[]) => {
      this.todaysVisits = visits.length;
    });

    // Load active visits
    this.visitService.getVisitsByStatus(VisitStatus.IN_PROGRESS).subscribe((visits: Visit[]) => {
      this.activeVisits = visits.length;
    });
  }
}
