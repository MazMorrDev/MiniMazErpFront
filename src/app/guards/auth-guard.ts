import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Si NO estamos en el navegador (estamos en servidor durante SSR)
  // Devolver true TEMPORALMENTE para que la prerenderización continúe
  if (!isPlatformBrowser(platformId)) {
    console.log('SSR/Prerender: authGuard skipping localStorage check');
    return true; // Permitir la carga inicial
  }

  // Solo en el navegador hacemos la verificación real
  if (loginService.isUserLoggedIn()) {
    return true;
  }

  // Redirige al login guardando la URL original
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
