import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentDevelopment } from '../environments/environment-development';
import { Inventory } from '../interfaces/inventory/inventory.dto';
import { CreateInventoryDto } from '../interfaces/inventory/create-inventory.dto';
import { UpdateInventoryDto } from '../interfaces/inventory/update-inventory.dto';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  // CRUD completo
  getAll(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.apiUrl}/api/Inventory`);
  }

  getById(id: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/api/Inventory/${id}`);
  }

  create(inventoryDto: CreateInventoryDto): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.apiUrl}/api/Inventory`, inventoryDto);
  }

  update(id: number, inventoryDto: UpdateInventoryDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Inventory/${id}`, inventoryDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Inventory/${id}`);
  }
}

