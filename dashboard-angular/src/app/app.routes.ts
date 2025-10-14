import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/auth.guard';
import { ReceptionGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'reception',
    loadComponent: () => import('./pages/reception/reception-dashboard.component').then(m => m.ReceptionDashboardComponent),
    canActivate: [AuthGuard, ReceptionGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
