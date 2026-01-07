import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR, siempre permitir (el cliente hará la validación real)
  if (!isPlatformBrowser(platformId)) {
    console.log('SSR: Permitiendo carga inicial');
    return true;
  }

  // En el navegador, hacer validación real
  if (loginService.isUserLoggedIn()) {
    return true;
  }

  // Redirigir a login
  const returnUrl = state.url;
  router.navigate(['/login'], {
    queryParams: {
      returnUrl: returnUrl || '/',
      reason: 'auth_required'
    }
  });

  return false;
};