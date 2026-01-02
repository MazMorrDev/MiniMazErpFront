import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request';
import { Router } from '@angular/router';
import { ApiTokenResponse } from '../interfaces/token-response';
import { Environment } from '../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = Environment.apiUrl;

  login(loginRequest: LoginRequest) {
    const url = `${this.apiUrl}/user/login`;
    return this.http.post<ApiTokenResponse>(url, loginRequest);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isUserLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
