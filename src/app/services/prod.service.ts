import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  http = inject(HttpClient);
  url = environment.url;

  getProducts() {
    return this.http.get(`${this.url}/api/products`);
  }
}
