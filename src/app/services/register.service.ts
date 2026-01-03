import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from 'express';
import { Environment } from '../environments/environment';
import { RegisterRequest } from '../interfaces/register-request';
import { ApiTokenResponse } from '../interfaces/token-response';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = Environment.apiUrl;

  register(registerRequest: RegisterRequest) {
    const url = `${this.apiUrl}/api/Client/`;
    return this.http.post<ApiTokenResponse>(url, registerRequest);
  }
}
