// interceptors/token-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login.service';

// token-interceptor.ts - versión corregida
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // URLs que NO requieren token (login y registro)
  const excludedUrls = [
    '/api/Client/login',    // Solo login
    '/api/Client/register'  // Si tienes registro
  ];
  
  // Verificar si la URL actual está en la lista de excluidas
  const fullUrl = req.url;
  const isExcluded = excludedUrls.some(url => fullUrl.includes(url));
  const isApiRequest = fullUrl.includes('/api/');
  
  // Si no es API o está excluida, no añadir token
  if (!isApiRequest || isExcluded) {
    return next(req);
  }
  
  // Obtener token usando LoginService para consistencia
  const loginService = inject(LoginService);
  const token = loginService.getToken();  // Usar el servicio en lugar de localStorage directamente
  
  // Si no hay token, redirigir a login
  if (!token) {
    if (typeof window !== 'undefined') {
      console.warn('No token found for API request to:', req.url);
      router.navigate(['/login'], {
        queryParams: { 
          returnUrl: router.url,
          reason: 'no_token'
        }
      });
    }
    return next(req); // La petición fallará con 401
  }
  
  // Verificar si el token está expirado
  if (loginService.isTokenExpired()) {
    if (typeof window !== 'undefined') {
      console.warn('Token expired for request to:', req.url);
      loginService.logout();
      router.navigate(['/login'], {
        queryParams: { 
          returnUrl: router.url,
          reason: 'token_expired'
        }
      });
    }
    return next(req); // La petición fallará con 401
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
      if (error.status === 401 && isApiRequest && typeof window !== 'undefined') {
        console.warn('Token invalid for API request:', req.url);
        handleUnauthorized(router);
      }
      return throwError(() => error);
    })
  );
};