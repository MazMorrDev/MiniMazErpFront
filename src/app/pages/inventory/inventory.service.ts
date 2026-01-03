import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EnvironmentDevelopment } from '../../environments/environment-development';
import { Inventory } from './Dtos/inventory';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private url = `${this.apiUrl}/api/Inventory/`;

  getAll(){
    return this.http.get<Inventory>(this.url)
  }

  getById(id:number){
    return this.http.get<Inventory>(this.url+id)
  }

  create(inventory:Inventory){

  }
}
