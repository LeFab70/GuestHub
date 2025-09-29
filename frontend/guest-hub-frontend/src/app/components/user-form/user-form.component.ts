import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { User, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="user-form-container">
      <div class="header">
        <button mat-icon-button routerLink="/users">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Edit User' : 'Add New User' }}</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter email address">
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                <mat-error *ngIf="userForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Department</mat-label>
                <input matInput formControlName="department" placeholder="Enter department">
                <mat-error *ngIf="userForm.get('department')?.hasError('required')">
                  Department is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Position</mat-label>
                <input matInput formControlName="position" placeholder="Enter position">
                <mat-error *ngIf="userForm.get('position')?.hasError('required')">
                  Position is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Role</mat-label>
                <mat-select formControlName="userRole">
                  <mat-option *ngFor="let role of userRoles" [value]="role">
                    {{ role | titlecase }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="userForm.get('userRole')?.hasError('required')">
                  Role is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field" *ngIf="isEditMode">
                <mat-label>Status</mat-label>
                <mat-select formControlName="isActive">
                  <mat-option [value]="true">Active</mat-option>
                  <mat-option [value]="false">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button type="button" mat-button routerLink="/users">Cancel</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="userForm.invalid">
                <mat-icon>{{ isEditMode ? 'save' : 'person_add' }}</mat-icon>
                {{ isEditMode ? 'Update User' : 'Add User' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .header h1 {
      margin: 0;
    }

    .user-form {
      padding: 20px 0;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  userRoles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      userRole: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUser();
      }
    });
  }

  private loadUser() {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe(user => {
        if (user) {
          this.userForm.patchValue(user);
        }
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.isEditMode && this.userId) {
        this.userService.updateUser(this.userId, userData).subscribe(updatedUser => {
          if (updatedUser) {
            this.router.navigate(['/users']);
          }
        });
      } else {
        this.userService.createUser(userData).subscribe(newUser => {
          if (newUser) {
            this.router.navigate(['/users']);
          }
        });
      }
    }
  }
}
