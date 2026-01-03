import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-user/register-user').then((m) => m.RegisterUser)
  },
  {
    path: 'movements',
    loadComponent: () => import('./pages/movements/movements').then((m) => m.Movements)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory').then((m) => m.Inventory)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: '**',
    canActivate: [authGuard],
    redirectTo: 'dashboard',
  },
];
