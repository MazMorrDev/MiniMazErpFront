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
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
