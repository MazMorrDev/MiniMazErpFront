// interceptors/token-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Función para obtener token de forma SSR-safe
function getToken(): string | null {
  // Verificar si estamos en el navegador
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Función para manejar errores SSR-safe
function handleUnauthorized(router: Router): void {
  // Solo ejecutar en navegador
  if (typeof window !== 'undefined') {
    // Limpiar tokens
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('token');
    }
    
    // Verificar si ya estamos en login para evitar ciclos
    if (!router.url.includes('/login')) {
      router.navigate(['/login'], {
        queryParams: { 
          expired: 'true',
          returnUrl: router.url 
        }
      });
    }
  }
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // URLS que no requieren token
  const excludedUrls = [
    '/api/Client/login',
    '/api/Client/'
  ];
  
  // Verificar si la URL está excluida
  const isExcluded = excludedUrls.some(url => req.url.includes(url));
  const isApiRequest = req.url.includes('/api/');
  
  // Si no es API o está excluida, no añadir token
  if (!isApiRequest || isExcluded) {
    return next(req);
  }
  
  // Obtener token de forma SSR-safe
  const token = getToken();
  
  // Si no hay token, continuar sin él (el servidor responderá con 401)
  if (!token) {
    // Solo log en navegador para desarrollo
    if (typeof window !== 'undefined') {
      console.warn('No token found for API request to:', req.url);
    }
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
      // Solo manejar en navegador y para peticiones API
      if (error.status === 401 && isApiRequest && typeof window !== 'undefined') {
        console.warn('Token expired or invalid');
        handleUnauthorized(router);
      }
      
      return throwError(() => error);
    })
  );
};