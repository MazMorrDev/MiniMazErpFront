// services/login.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LoginRequest } from '../interfaces/login/login-request.dto';
import { Router } from '@angular/router';
import { ApiTokenResponse } from '../interfaces/login/token-response';
import { EnvironmentDevelopment } from '../environments/environment-development';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  login(loginRequest: LoginRequest) {
    const url = `${this.apiUrl}/api/Client/login`;
    return this.http.post<ApiTokenResponse>(url, loginRequest);
  }

  // Guardar token solo en navegador
  saveToken(tokenResponse: ApiTokenResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Guardar token
    localStorage.setItem(TOKEN_KEY, tokenResponse.token);
    
    // Calcular expiración
    let expirationTime: number;
    if (tokenResponse.expiration) {
      const expirationDate = new Date(tokenResponse.expiration);
      expirationTime = expirationDate.getTime();
    } else {
      expirationTime = new Date().getTime() + (60 * 60 * 1000); // 1 hora
    }
    
    localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
  }

  // Obtener token solo en navegador
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  // Logout solo en navegador
  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // Verificar token expirado
  isTokenExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    if (!expiration) return true;
    
    const now = new Date().getTime();
    return now > parseInt(expiration);
  }

  // Verificar usuario logueado
  isUserLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }
}