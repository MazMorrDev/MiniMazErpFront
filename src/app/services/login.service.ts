import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginRequest } from '../interfaces/login/login-request.dto';
import { Router } from '@angular/router';
import { ApiTokenResponse } from '../interfaces/login/token-response';
import { EnvironmentDevelopment } from '../environments/environment-development';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRATION_KEY = 'expiration';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  login(loginRequest: LoginRequest) {
    const url = `${this.apiUrl}/api/Client/login`;
    return this.http.post<ApiTokenResponse>(url, loginRequest);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isUserLoggedIn(): boolean {
    // Primero verifica el token principal
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return false;
    }

    // Verificar expiración si existe
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    if (expiration) {
      const now = new Date().getTime();
      if (now > parseInt(expiration)) {
        this.logout(); // Token expirado, limpiar
        return false;
      }
    }

    return true;
  }
}
