import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home)
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
