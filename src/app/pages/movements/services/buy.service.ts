import { inject, Injectable } from '@angular/core';
import { EnvironmentDevelopment } from '../../../environments/environment-development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BuyService {
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private readonly http = inject(HttpClient);
}
