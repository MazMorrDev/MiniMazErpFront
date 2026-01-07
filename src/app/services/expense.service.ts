import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentDevelopment } from '../environments/environment-development';
import { Expense } from '../interfaces/movements/expense.dto';
import { CreateExpenseDto } from '../interfaces/movements/create-expense.dto';
import { UpdateExpenseDto } from '../interfaces/movements/update-expense.dto';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly apiUrl = EnvironmentDevelopment.apiUrl;
  private readonly http = inject(HttpClient);

  // CRUD básico
  getAll(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/api/Expense`);
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/api/Expense/${id}`);
  }

  create(expenseDto: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/api/Expense`, expenseDto);
  }

  update(id: number, expenseDto: UpdateExpenseDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Expense/${id}`, expenseDto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Expense/${id}`);
  }

  // Endpoint adicional para filtrar por tipo
  getByType(expenseType: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/api/Expense/type/${expenseType}`);
  }
}