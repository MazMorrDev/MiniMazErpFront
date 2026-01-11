import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movement } from '../interfaces/movements/movement.dto';
import { CreateMovementDto } from '../interfaces/movements/create-movement.dto';
import { UpdateMovementDto } from '../interfaces/movements/update-movement.dto';
import { EnvironmentDevelopment } from '../../environments/environment.development';
import { Buy } from '../interfaces/movements/buy.dto';
import { BuyService } from './buy.service';
import { Sell } from '../interfaces/movements/sell.dto';
import { SellService } from './sell.service';

@Injectable({
  providedIn: 'root',
})
export class MovementsService {
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly buyService = inject(BuyService);
  private readonly sellService = inject(SellService);

  // CRUD básico
  getAll(): Observable<Movement[]> {
    return this.http.get<Movement[]>(`${this.apiUrl}/api/Movement`);
  }

  getAllBuys():Observable<Buy[]>{
    return this.buyService.getAll();
  }

  getAllSells(): Observable<Sell[]>{
    return this.sellService.getAll();
  }

  getById(id: number): Observable<Movement> {
    return this.http.get<Movement>(`${this.apiUrl}/api/Movement/${id}`);
  }

  create(movementDto: CreateMovementDto): Observable<Movement> {
    return this.http.post<Movement>(`${this.apiUrl}/api/Movement`, movementDto);
  }

  update(id: number, movementDto: UpdateMovementDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Movement/${id}`, movementDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Movement/${id}`);
  }
}