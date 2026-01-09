import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

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