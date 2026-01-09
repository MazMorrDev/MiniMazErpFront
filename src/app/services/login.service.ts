import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../interfaces/login/login-request.dto';
import { ApiTokenResponse } from '../interfaces/login/token-response';
import { EnvironmentDevelopment } from '../../environments/environment.development';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';

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

  saveToken(tokenResponse: ApiTokenResponse): void {
    localStorage.setItem(TOKEN_KEY, tokenResponse.token);

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

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
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