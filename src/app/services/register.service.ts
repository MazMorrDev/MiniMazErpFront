import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterRequest } from '../interfaces/register-request';
import { ApiTokenResponse } from '../interfaces/token-response';
import { EnvironmentDevelopment } from '../environments/environment-development';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  register(registerRequest: RegisterRequest) {
    const url = `${this.apiUrl}/api/Client/`;
    return this.http.post<ApiTokenResponse>(url, registerRequest);
  }
}
