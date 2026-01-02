import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isUserLoggedIn()) {
    return true;
  }

  // Redirige al login guardando la URL original
  router.navigate(['/login'], {
    queryParams: { returnUrl: router.url },
  });
  return false;
};
