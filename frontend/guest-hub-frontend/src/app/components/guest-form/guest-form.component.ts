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
import { Guest, IdType } from '../../models/guest.model';
import { GuestService } from '../../services/guest.service';

@Component({
  selector: 'app-guest-form',
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
    <div class="guest-form-container">
      <div class="header">
        <button mat-icon-button routerLink="/guests">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Edit Guest' : 'Add New Guest' }}</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="guestForm" (ngSubmit)="onSubmit()" class="guest-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-error *ngIf="guestForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-error *ngIf="guestForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter email address">
                <mat-error *ngIf="guestForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="guestForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                <mat-error *ngIf="guestForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Company</mat-label>
                <input matInput formControlName="company" placeholder="Enter company name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Position</mat-label>
                <input matInput formControlName="position" placeholder="Enter position">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>ID Type</mat-label>
                <mat-select formControlName="idType">
                  <mat-option value="">Select ID Type</mat-option>
                  <mat-option *ngFor="let idType of idTypes" [value]="idType">
                    {{ idType }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>ID Number</mat-label>
                <input matInput formControlName="idNumber" placeholder="Enter ID number">
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button type="button" mat-button routerLink="/guests">Cancel</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="guestForm.invalid">
                <mat-icon>{{ isEditMode ? 'save' : 'person_add' }}</mat-icon>
                {{ isEditMode ? 'Update Guest' : 'Add Guest' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .guest-form-container {
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

    .guest-form {
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
export class GuestFormComponent implements OnInit {
  guestForm: FormGroup;
  isEditMode = false;
  guestId: number | null = null;
  idTypes = Object.values(IdType);

  constructor(
    private fb: FormBuilder,
    private guestService: GuestService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.guestForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      company: [''],
      position: [''],
      idType: [''],
      idNumber: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.guestId = +params['id'];
        this.loadGuest();
      }
    });
  }

  private loadGuest() {
    if (this.guestId) {
      this.guestService.getGuestById(this.guestId).subscribe(guest => {
        if (guest) {
          this.guestForm.patchValue(guest);
        }
      });
    }
  }

  onSubmit() {
    if (this.guestForm.valid) {
      const guestData = this.guestForm.value;
      
      if (this.isEditMode && this.guestId) {
        this.guestService.updateGuest(this.guestId, guestData).subscribe(updatedGuest => {
          if (updatedGuest) {
            this.router.navigate(['/guests']);
          }
        });
      } else {
        this.guestService.createGuest(guestData).subscribe(newGuest => {
          if (newGuest) {
            this.router.navigate(['/guests']);
          }
        });
      }
    }
  }
}
