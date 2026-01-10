// services/movement.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movement } from '../interfaces/movements/movement.dto';
import { CreateMovementDto } from '../interfaces/movements/create-movement.dto';
import { UpdateMovementDto } from '../interfaces/movements/update-movement.dto';
import { EnvironmentDevelopment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MovementsService {
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private readonly http = inject(HttpClient);

  // CRUD básico
  getAll(): Observable<Movement[]> {
    return this.http.get<Movement[]>(`${this.apiUrl}/api/Movement`);
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

  // Método para obtener múltiples movements por IDs (si tu backend lo soporta)
  getByIds(ids: number[]): Observable<Movement[]> {
    // Si tu backend tiene endpoint para múltiples IDs
    return this.http.post<Movement[]>(`${this.apiUrl}/api/Movement/batch`, { ids });
    
    // OPCIONAL: Si no, hacer llamadas individuales
    // return forkJoin(ids.map(id => this.getById(id)));
  }

  // Método para obtener movements por inventoryId
  getByInventoryId(inventoryId: number): Observable<Movement[]> {
    return this.http.get<Movement[]>(`${this.apiUrl}/api/Movement/inventory/${inventoryId}`);
  }
}