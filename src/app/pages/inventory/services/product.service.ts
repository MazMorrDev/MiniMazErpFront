import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product.dto';
import { EnvironmentDevelopment } from '../../../environments/environment-development';
import { CreateProductDto } from '../interfaces/create-product.dto';
import { UpdateProductDto } from '../interfaces/update-product.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;

  getAll(): Observable<Product[]> {
    const url = `${this.apiUrl}/api/Product/`;
    return this.http.get<Product[]>(url);
  }

  get(id: number): Observable<Product> {
    const url = `${this.apiUrl}/api/Product/${id}`;
    return this.http.get<Product>(url);
  }

  create(product: CreateProductDto): Observable<Product> {
    const url = `${this.apiUrl}/api/Product`;
    return this.http.post<Product>(url, product);
  }

  update(id: number, product: UpdateProductDto): Observable<void> {
    const url = `${this.apiUrl}/api/Product/${id}`;
    return this.http.put<void>(url, product);
  }

  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/api/Product/${id}`;
    return this.http.delete<void>(url);
  }
}
