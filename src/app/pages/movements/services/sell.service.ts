import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentDevelopment } from '../../../environments/environment-development';
import { Sell } from '../interfaces/sell.dto';
import { CreateSellDto } from '../interfaces/create-sell.dto';
import { UpdateSellDto } from '../interfaces/update-sell.dto';

@Injectable({
  providedIn: 'root',
})
export class SellService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  getAll(): Observable<Sell[]> {
    return this.http.get<Sell[]>(`${this.apiUrl}/api/Sell`);
  }

  getById(id: number): Observable<Sell> {
    return this.http.get<Sell>(`${this.apiUrl}/api/Sell/${id}`);
  }

  create(sellDto: CreateSellDto): Observable<Sell> {
    return this.http.post<Sell>(`${this.apiUrl}/api/Sell`, sellDto);
  }

  update(id: number, sellDto: UpdateSellDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Sell/${id}`, sellDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Sell/${id}`);
  }

  getByProductId(productId: number): Observable<Sell[]> {
    return this.http.get<Sell[]>(`${this.apiUrl}/api/Sell/product/${productId}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<Sell[]> {
    return this.http.get<Sell[]>(`${this.apiUrl}/api/Sell/date-range`, {
      params: { 
        startDate, 
        endDate 
      }
    });
  }

  getFullById(id: number): Observable<Sell> {
    return this.http.get<Sell>(`${this.apiUrl}/api/Sell/${id}/full`);
  }
}