import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/products-page/products_page.component').then(m => m.ProductsPageComponent)
  },
  {
    path: 'mov-inv',
    loadComponent: () => import('./pages/movimientos-inventario-page/mov_inv_page.component').then(m => m.MovInvPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
