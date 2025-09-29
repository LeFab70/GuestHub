import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GuestListComponent } from './components/guest-list/guest-list.component';
import { GuestFormComponent } from './components/guest-form/guest-form.component';
import { VisitListComponent } from './components/visit-list/visit-list.component';
import { VisitFormComponent } from './components/visit-form/visit-form.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'guests', component: GuestListComponent },
  { path: 'guests/new', component: GuestFormComponent },
  { path: 'guests/edit/:id', component: GuestFormComponent },
  { path: 'visits', component: VisitListComponent },
  { path: 'visits/new', component: VisitFormComponent },
  { path: 'visits/edit/:id', component: VisitFormComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/edit/:id', component: UserFormComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
