import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Movement } from '../interfaces/movement';

const STORAGE_KEY = 'inventory_movements_v1';

@Injectable({ providedIn: 'root' })
export class MovementService {
  constructor() {}

  private readAll(): Movement[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Movement[];
    } catch {
      return [];
    }
  }

  private writeAll(list: Movement[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  list(): Observable<Movement[]> {
    return of(this.readAll().sort((a, b) => (a.date < b.date ? 1 : -1)));
  }

  create(m: Omit<Movement, 'id'>): Observable<Movement> {
    const all = this.readAll();
    const newItem: Movement = { id: Date.now(), ...m } as Movement;
    all.push(newItem);
    this.writeAll(all);
    return of(newItem);
  }

  delete(id: number): Observable<void> {
    const all = this.readAll().filter((x) => x.id !== id);
    this.writeAll(all);
    return of(void 0);
  }
}
