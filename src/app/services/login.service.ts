import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../interfaces/login/login-request.dto';
import { ApiTokenResponse } from '../interfaces/login/token-response';
import { EnvironmentDevelopment } from '../../environments/environment.development';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';
const USER_ID_KEY = 'user_id';
const USER_NAME_KEY = 'user_name';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  login(loginRequest: LoginRequest) {
    const url = `${this.apiUrl}/api/User/login`;
    return this.http.post<ApiTokenResponse>(url, loginRequest);
  }

  saveToken(tokenResponse: ApiTokenResponse): void {
    localStorage.setItem(TOKEN_KEY, tokenResponse.token);

    // Guardar datos del usuario
    if (tokenResponse.user) {
      localStorage.setItem(USER_ID_KEY, tokenResponse.user.id.toString());
      localStorage.setItem(USER_NAME_KEY, tokenResponse.user.name);
    }

    let expirationTime: number;
    if (tokenResponse.expiration) {
      const expirationDate = new Date(tokenResponse.expiration);
      expirationTime = expirationDate.getTime();
    } else {
      expirationTime = new Date().getTime() + (60 * 60 * 1000);
    }

    localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUserName(): string | null {
    return localStorage.getItem(USER_NAME_KEY);
  }

  getCurrentUserId(): number | null {
    const userIdStr = localStorage.getItem(USER_ID_KEY);
    return userIdStr ? parseInt(userIdStr, 10) : null;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    if (!expiration) return true;

    const now = new Date().getTime();
    return now > parseInt(expiration);
  }

  isUserLoggedIn(): boolean {
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