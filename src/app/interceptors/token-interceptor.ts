import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // URLs que NO requieren token
  const excludedUrls = [
    '/api/Client/login',
    '/api/Client/register'
  ];

  // Verificar si la URL actual está excluida
  const fullUrl = req.url;
  const isExcluded = excludedUrls.some(url => fullUrl.includes(url));
  const isApiRequest = fullUrl.includes('/api/');

  // Si no es API o está excluida, no añadir token
  if (!isApiRequest || isExcluded) {
    return next(req);
  }

  // Obtener token
  const token = loginService.getToken();

  // Si no hay token, dejar pasar (fallará con 401)
  if (!token) {
    router.navigate(['/login'])
    return next(req);
  }

  // Verificar si el token está expirado
  if (loginService.isTokenExpired()) {
    loginService.logout();
    return next(req);
  }

  // Clonar request con token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Procesar con manejo de errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        loginService.logout();
      }
      return throwError(() => error);
    })
  );
};