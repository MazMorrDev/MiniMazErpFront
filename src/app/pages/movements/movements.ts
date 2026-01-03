import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product.service';
import { MovementService } from '../../services/movement.service';
import { Product } from '../../interfaces/product';
import { Movement } from '../../interfaces/movement';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../components/navbar/navbar";

@Component({
  standalone: true,
  selector: 'app-mov-inv',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    DatePipe,
    NavbarComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movements.html',
  styleUrl: './movements.scss'
})
export class Movements {
  private productService = inject(ProductService);
  private movementService = inject(MovementService);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  products = signal<Product[]>([]);
  allMovements = signal<Movement[]>([]);

  // CORREGIDO: Simplificar a solo productId
  filters = signal<number | undefined>(undefined);

  // Computed signal for filtered movements - CORREGIDO
  filteredMovements = computed(() => {
    const movements = this.allMovements();
    const productId = this.filters();

    if (!productId) {
      return movements;
    }

    return movements.filter(movement => movement.productId === productId);
  });

  // MatTable configuration
  displayedColumns = ['date', 'productName', 'type', 'quantity', 'notes', 'actions'];

  // Reactive form with validation
  form = this.fb.group({
    productId: [null as number | null],
    productName: [''],
    type: ['IN', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    date: [new Date(), Validators.required],
    notes: ['']
  });

  constructor() {
    this.loadProducts();
    this.loadMovements();
  }

  loadProducts() {
    this.productService.list().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.products.set([])
    });
  }

  loadMovements() {
    this.movementService.list().subscribe({
      next: (m) => this.allMovements.set(m),
      error: () => this.allMovements.set([])
    });
  }

  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const qty = Number(v.quantity) || 0;

    const productName = v.productId
      ? this.products().find((x) => x.id === v.productId)?.name || 'Unknown'
      : v.productName?.trim() || 'Unknown';

    if (!productName || qty <= 0) return;

    // CORREGIDO: Incluir el campo 'type' que faltaba
    const movement: Omit<Movement, 'id'> = {
      productId: v.productId ?? undefined,
      productName,
      quantity: qty,
      date: v.date ? new Date(v.date).toISOString() : new Date().toISOString(),
      notes: v.notes ?? ''
    };

    this.movementService.create(movement).subscribe({
      next: () => {
        this.loadMovements();
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.form.reset({
      productId: null,
      productName: '',
      type: 'IN',
      quantity: 1,
      date: new Date(),
      notes: ''
    });
  }

  // NUEVO: Método para actualizar el filtro
  updateFilterProductId(productId: number | undefined) {
    this.filters.set(productId);
  }

  clearFilters() {
    this.filters.set(undefined);
  }

  remove(movement: Movement) {
    // Nota: Necesitarás crear el componente ConfirmDialogComponent o usar confirm() simple
    const ok = confirm(`Are you sure you want to delete the movement for "${movement.productName}"?`);
    if (!ok) return;

    this.movementService.delete(movement.id).subscribe({
      next: () => this.loadMovements()
    });
  }
}