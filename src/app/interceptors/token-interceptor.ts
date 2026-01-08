// interceptors/token-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login.service';
import { isPlatformBrowser } from '@angular/common';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  console.log('Interceptor - Platform:', isBrowser ? 'Browser' : 'Server');
  console.log('Interceptor - URL:', req.url);

  // URLs que NO requieren token (login y registro)
  const excludedUrls = [
    '/api/Client/login',
    '/api/Client/register'
  ];

  // Verificar si la URL actual está en la lista de excluidas
  const fullUrl = req.url;
  const isExcluded = excludedUrls.some(url => fullUrl.includes(url));
  const isApiRequest = fullUrl.includes('/api/');

  // Si no es API o está excluida, no añadir token
  if (!isApiRequest || isExcluded) {
    return next(req);
  }

  // EN SSR: No procesar peticiones API que requieran token
  if (!isBrowser) {
    console.log('SSR: Skipping API request that requires token:', req.url);
    
    // Opción 1: Retornar error controlado (recomendado)
    // return throwError(() => new Error('SSR: API requests with token not supported'));
    
    // Opción 2: Dejar pasar sin token (fallará en servidor pero se reintentará en cliente)
    return next(req);
  }

  // EN NAVEGADOR: Lógica normal
  const token = loginService.getToken();

  // Si no hay token, redirigir a login
  if (!token) {
    console.warn('No token found for API request to:', req.url);
    // Podemos redirigir aquí o dejar que falle con 401
    return next(req);
  }

  // Verificar si el token está expirado
  if (loginService.isTokenExpired()) {
    console.warn('Token expired for request to:', req.url);
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
        console.warn('Token invalid for API request:', req.url);
        if (isBrowser) {
          loginService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};