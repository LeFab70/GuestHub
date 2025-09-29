import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Visit } from '../../models/visit.model';
import { Guest } from '../../models/guest.model';
import { User } from '../../models/user.model';
import { VisitService } from '../../services/visit.service';
import { GuestService } from '../../services/guest.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-visit-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule
  ],
  template: `
    <div class="visit-form-container">
      <div class="header">
        <button mat-icon-button routerLink="/visits">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Edit Visit' : 'Schedule New Visit' }}</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="visitForm" (ngSubmit)="onSubmit()" class="visit-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Guest</mat-label>
                <mat-select formControlName="guestId">
                  <mat-option *ngFor="let guest of guests$ | async" [value]="guest.id">
                    {{ guest.firstName }} {{ guest.lastName }} ({{ guest.email }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="visitForm.get('guestId')?.hasError('required')">
                  Guest is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Host</mat-label>
                <mat-select formControlName="hostId">
                  <mat-option *ngFor="let user of users$ | async" [value]="user.id">
                    {{ user.firstName }} {{ user.lastName }} ({{ user.department }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="visitForm.get('hostId')?.hasError('required')">
                  Host is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Visit Date & Time</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="visitDate" placeholder="Select date and time">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="visitForm.get('visitDate')?.hasError('required')">
                  Visit date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Expected Duration (minutes)</mat-label>
                <input matInput type="number" formControlName="expectedDuration" placeholder="Enter duration in minutes">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Purpose</mat-label>
                <textarea matInput formControlName="purpose" placeholder="Enter visit purpose" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" placeholder="Enter any additional notes" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button type="button" mat-button routerLink="/visits">Cancel</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="visitForm.invalid">
                <mat-icon>{{ isEditMode ? 'save' : 'event' }}</mat-icon>
                {{ isEditMode ? 'Update Visit' : 'Schedule Visit' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .visit-form-container {
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

    .visit-form {
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

    .form-field.full-width {
      flex: 1 1 100%;
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
export class VisitFormComponent implements OnInit {
  visitForm: FormGroup;
  isEditMode = false;
  visitId: number | null = null;
  guests$: Observable<Guest[]>;
  users$: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private guestService: GuestService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.visitForm = this.fb.group({
      guestId: ['', Validators.required],
      hostId: ['', Validators.required],
      visitDate: ['', Validators.required],
      expectedDuration: [''],
      purpose: [''],
      notes: ['']
    });

    this.guests$ = this.guestService.getAllGuests();
    this.users$ = this.userService.getAllUsers();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.visitId = +params['id'];
        this.loadVisit();
      }
    });
  }

  private loadVisit() {
    if (this.visitId) {
      this.visitService.getVisitById(this.visitId).subscribe(visit => {
        if (visit) {
          this.visitForm.patchValue({
            guestId: visit.guestId,
            hostId: visit.hostId,
            visitDate: visit.visitDate,
            expectedDuration: visit.expectedDuration,
            purpose: visit.purpose,
            notes: visit.notes
          });
        }
      });
    }
  }

  onSubmit() {
    if (this.visitForm.valid) {
      const visitData = this.visitForm.value;
      visitData.createdById = 1; // This should come from authentication service
      
      if (this.isEditMode && this.visitId) {
        this.visitService.updateVisit(this.visitId, visitData).subscribe(updatedVisit => {
          if (updatedVisit) {
            this.router.navigate(['/visits']);
          }
        });
      } else {
        this.visitService.createVisit(visitData).subscribe(newVisit => {
          if (newVisit) {
            this.router.navigate(['/visits']);
          }
        });
      }
    }
  }
}
