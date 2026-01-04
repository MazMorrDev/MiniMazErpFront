import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Estrategia para SSR: Permitir carga inicial
  if (!isPlatformBrowser(platformId)) {
    console.log('SSR: Permitiendo carga inicial (sin verificación de token)');
    return true; // Permitir que SSR/prerender continúe
  }

  // En el cliente (navegador), hacer verificación real
  if (loginService.isUserLoggedIn()) {
    return true;
  }

  // Si no hay token, verificar si hay en localStorage (fallback)
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

  console.log('Usuario no autenticado, redirigiendo a login');

  // Redirigir a login guardando la URL original
  const returnUrl = state.url.split('?')[0];
  router.navigate(['/login'], {
    queryParams: {
      returnUrl: returnUrl || '/dashboard',
      reason: 'auth_required'
    },
    replaceUrl: true
  });

  return false;
};