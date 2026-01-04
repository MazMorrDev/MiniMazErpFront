import { inject, Injectable } from '@angular/core';
import { EnvironmentDevelopment } from '../environments/environment-development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Buy } from '../interfaces/buy.dto';
import { CreateBuyDto } from '../interfaces/create-buy.dto';
import { UpdateBuyDto } from '../interfaces/update-buy.dto';

@Injectable({
  providedIn: 'root',
})
export class BuyService {
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private readonly http = inject(HttpClient);

  // CRUD básico
  getAll(): Observable<Buy[]> {
    return this.http.get<Buy[]>(`${this.apiUrl}/api/Buy`);
  }

  getById(id: number): Observable<Buy> {
    return this.http.get<Buy>(`${this.apiUrl}/api/Buy/${id}`);
  }

  create(buyDto: CreateBuyDto): Observable<Buy> {
    return this.http.post<Buy>(`${this.apiUrl}/api/Buy`, buyDto);
  }

  update(id: number, buyDto: UpdateBuyDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Buy/${id}`, buyDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Buy/${id}`);
  }
}