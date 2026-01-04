import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-user/register').then((m) => m.RegisterUser)
  },

  // Rutas principales protegidas
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Dashboard - Página principal
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
        data: { title: 'Dashboard' }
      },

      // Inventory - Gestión de inventario
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory').then((m) => m.Inventory),
        data: { title: 'Inventory' }
      },

      // Movements - Movimientos (compras, ventas, gastos)
      {
        path: 'movements',
        loadComponent: () => import('./pages/movements/movements').then((m) => m.Movements),
        data: { title: 'Movements' }
      },

      // Redirección por defecto cuando se accede a la raíz
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },

  // Redirecciones globales
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },

  // Ruta comodín (404) - redirige al dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];