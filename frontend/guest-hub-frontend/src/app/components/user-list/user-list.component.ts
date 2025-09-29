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
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
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
    RouterModule,
    FormsModule
  ],
  template: `
    <div class="user-list-container">
      <div class="header">
        <h1>Users Management</h1>
        <button mat-raised-button color="primary" routerLink="/users/new">
          <mat-icon>person_add</mat-icon>
          Add New User
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search by name or email">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <div class="filter-buttons">
              <button mat-button [class.active]="filterType === 'all'" (click)="filterByType('all')">
                All Users
              </button>
              <button mat-button [class.active]="filterType === 'active'" (click)="filterByType('active')">
                Active Users
              </button>
              <button mat-button [class.active]="filterType === 'admins'" (click)="filterByType('admins')">
                Administrators
              </button>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="users$" class="users-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-name">
                    <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let user">
                  <div class="department-info">
                    <div>{{ user.department }}</div>
                    <div class="user-position">{{ user.position }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Contact Column -->
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let user">
                  <div class="contact-info">
                    {{ user.phoneNumber }}
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip-set>
                    <mat-chip [ngClass]="'role-' + user.userRole.toLowerCase()">
                      {{ user.userRole | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip-set>
                    <mat-chip [class.active]="user.isActive" [class.inactive]="!user.isActive">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item routerLink="/users/edit/{{ user.id }}">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="toggleStatus(user)">
                      <mat-icon>{{ user.isActive ? 'person_off' : 'person' }}</mat-icon>
                      <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
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
    .user-list-container {
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

    .users-table {
      width: 100%;
    }

    .user-name strong {
      font-size: 1.1em;
    }

    .user-email {
      color: #666;
      font-size: 0.9em;
    }

    .department-info {
      font-size: 0.9em;
    }

    .user-position {
      color: #666;
      font-size: 0.8em;
    }

    .contact-info {
      font-size: 0.9em;
    }

    .role-admin {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }

    .role-manager {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .role-receptionist {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .role-employee {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .active {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .inactive {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }

    .delete-action {
      color: #d32f2f;
    }

    .delete-action mat-icon {
      color: #d32f2f;
    }
  `]
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]>;
  searchTerm = '';
  filterType = 'all';

  displayedColumns: string[] = ['name', 'department', 'contact', 'role', 'status', 'actions'];

  constructor(private userService: UserService) {
    this.users$ = this.userService.getAllUsers();
  }

  ngOnInit() {
    // Component initialization
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.users$ = this.userService.searchUsers(this.searchTerm);
    } else {
      this.users$ = this.userService.getAllUsers();
    }
  }

  filterByType(type: string) {
    this.filterType = type;
    switch (type) {
      case 'active':
        this.users$ = this.userService.getActiveUsers();
        break;
      case 'admins':
        this.users$ = this.userService.getUsersByRole(UserRole.ADMIN);
        break;
      default:
        this.users$ = this.userService.getAllUsers();
    }
  }

  toggleStatus(user: User) {
    if (user.id) {
      if (user.isActive) {
        this.userService.deactivateUser(user.id).subscribe(updatedUser => {
          if (updatedUser) {
            this.users$ = this.userService.getAllUsers();
          }
        });
      } else {
        this.userService.activateUser(user.id).subscribe(updatedUser => {
          if (updatedUser) {
            this.users$ = this.userService.getAllUsers();
          }
        });
      }
    }
  }

  deleteUser(user: User) {
    if (user.id && confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user.id).subscribe(success => {
        if (success) {
          this.users$ = this.userService.getAllUsers();
        }
      });
    }
  }
}
