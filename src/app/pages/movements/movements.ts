import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ProductService } from '../inventory/services/product.service';
import { Product } from '../inventory/interfaces/product.dto';
import { Buy } from './interfaces/buy.dto';
import { Sell } from './interfaces/sell.dto';
import { Expense } from './interfaces/expense.dto';
import { ExpenseType } from './enums/expense-type.enum';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../components/navbar/navbar";

// Tipo unión para todos los movimientos posibles
type MovementUnion = Buy | Sell | Expense;

// Tipo para discriminación
type MovementType = 'BUY' | 'SELL' | 'EXPENSE';

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
    MatRadioModule,
    NavbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movements.html',
  styleUrl: './movements.scss'
})
export class Movements {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  products = signal<Product[]>([]);
  allMovements = signal<MovementUnion[]>([]);

  // Tipos de movimiento
  movementTypes = signal<{ value: MovementType, label: string, icon: string }[]>([
    { value: 'BUY', label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL', label: 'Venta', icon: 'point_of_sale' },
    { value: 'EXPENSE', label: 'Gasto', icon: 'payments' }
  ]);

  expenseTypes = signal<{ value: ExpenseType, label: string }[]>([
    // Agrega aquí los tipos de gasto específicos
    { value: ExpenseType.RENT, label: 'Alquiler' },
    { value: ExpenseType.UTILITIES, label: 'Servicios' },
    { value: ExpenseType.SALARIES, label: 'Sueldos' },
    { value: ExpenseType.MAINTENANCE, label: 'Mantenimiento' },
    { value: ExpenseType.OTHER, label: 'Otros' }
  ]);

  // Filtros
  filters = signal<{
    productId?: number;
    movementType?: MovementType;
    startDate?: Date;
    endDate?: Date;
  }>({});

  // Computed signal for filtered movements
  filteredMovements = computed(() => {
    const movements = this.allMovements();
    const filter = this.filters();

    return movements.filter(movement => {
      // Filtrar por producto
      if (filter.productId && movement.productId !== filter.productId) {
        return false;
      }

      // Filtrar por tipo de movimiento
      if (filter.movementType) {
        const movementType = this.getMovementType(movement);
        if (movementType !== filter.movementType) {
          return false;
        }
      }

      // Filtrar por fecha
      if (filter.startDate || filter.endDate) {
        const movementDate = new Date(movement.movementDate);

        if (filter.startDate && movementDate < filter.startDate) {
          return false;
        }

        if (filter.endDate && movementDate > filter.endDate) {
          return false;
        }
      }

      return true;
    });
  });

  // Estadísticas computadas
  movementStats = computed(() => {
    const movements = this.allMovements();

    const buys = movements.filter(m => this.isBuy(m));
    const sells = movements.filter(m => this.isSell(m));
    const expenses = movements.filter(m => this.isExpense(m));

    const totalBuys = buys.reduce((sum, buy) => {
      const b = buy as Buy;
      return sum + (b.unitPrice * b.quantity);
    }, 0);

    const totalSells = sells.reduce((sum, sell) => sum + sell.quantity, 0);
    const totalExpenses = expenses.reduce((sum, expense) => {
      const e = expense as Expense;
      return sum + e.totalPrice;
    }, 0);

    return {
      totalBuys: buys.length,
      totalSells: sells.length,
      totalExpenses: expenses.length,
      totalBuysAmount: totalBuys,
      totalExpensesAmount: totalExpenses,
      totalItemsSold: totalSells
    };
  });

  // Columnas dinámicas según tipo de movimiento
  displayedColumns = signal<string[]>([
    'date',
    'product',
    'type',
    'description',
    'quantity',
    'details',
    'actions'
  ]);

  // Formulario reactivo con controles dinámicos
  form = this.fb.group({
    movementType: ['BUY' as MovementType, Validators.required],
    productId: [null as number | null, Validators.required],
    description: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    movementDate: [new Date(), Validators.required],

    // Campos específicos para COMPRA
    unitPrice: [0, [Validators.required, Validators.min(0)]],

    // Campos específicos para GASTO
    expenseType: [ExpenseType.OTHER as ExpenseType],
    totalPrice: [0, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    this.loadProducts();

    // Observar cambios en el tipo de movimiento para mostrar/ocultar campos
    this.form.get('movementType')?.valueChanges.subscribe(type => {
      this.updateFormValidation(type as MovementType);
    });

    // Inicializar validaciones
    this.updateFormValidation('BUY');
  }

  loadProducts() {
    this.productService.list().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.products.set([])
    });
  }

  add() {
  }

  updateFormValidation(movementType: MovementType) {
    // Resetear todos los validadores primero
    this.form.get('unitPrice')?.clearValidators();
    this.form.get('totalPrice')?.clearValidators();
    this.form.get('expenseType')?.clearValidators();

    // Aplicar validadores según el tipo
    switch (movementType) {
      case 'BUY':
        this.form.get('unitPrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('unitPrice')?.enable();
        this.form.get('totalPrice')?.disable();
        this.form.get('expenseType')?.disable();
        break;

      case 'EXPENSE':
        this.form.get('totalPrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('expenseType')?.setValidators([Validators.required]);
        this.form.get('totalPrice')?.enable();
        this.form.get('expenseType')?.enable();
        this.form.get('unitPrice')?.disable();
        break;

      case 'SELL':
        this.form.get('unitPrice')?.disable();
        this.form.get('totalPrice')?.disable();
        this.form.get('expenseType')?.disable();
        break;
    }

    // Actualizar validación
    this.form.get('unitPrice')?.updateValueAndValidity();
    this.form.get('totalPrice')?.updateValueAndValidity();
    this.form.get('expenseType')?.updateValueAndValidity();
  }

  resetForm() {
    this.form.reset({
      movementType: 'BUY',
      productId: null,
      description: '',
      quantity: 1,
      movementDate: new Date(),
      unitPrice: 0,
      expenseType: ExpenseType.OTHER,
      totalPrice: 0
    });
    this.updateFormValidation('BUY');
  }

  // Métodos de ayuda para determinar tipos
  getMovementType(movement: MovementUnion): MovementType {
    if (this.isBuy(movement)) return 'BUY';
    if (this.isSell(movement)) return 'SELL';
    if (this.isExpense(movement)) return 'EXPENSE';
    return 'SELL'; // Por defecto
  }

  isBuy(movement: MovementUnion): movement is Buy {
    return 'unitPrice' in movement;
  }

  isSell(movement: MovementUnion): movement is Sell {
    return !('unitPrice' in movement) && !('expenseType' in movement);
  }

  isExpense(movement: MovementUnion): movement is Expense {
    return 'expenseType' in movement && 'totalPrice' in movement;
  }

  // Métodos para obtener detalles específicos
  getMovementDetails(movement: MovementUnion): string {
    if (this.isBuy(movement)) {
      return `Precio unitario: $${movement.unitPrice} | Total: $${movement.unitPrice * movement.quantity}`;
    }

    if (this.isExpense(movement)) {
      const expenseTypeLabel = this.expenseTypes().find(et => et.value === movement.expenseType)?.label || 'Otros';
      return `Tipo: ${expenseTypeLabel} | Total: $${movement.totalPrice}`;
    }

    return 'Venta';
  }

  // Métodos para filtros
  updateFilterProductId(productId: number | undefined) {
    this.filters.update(f => ({ ...f, productId }));
  }

  updateFilterMovementType(movementType: MovementType | undefined) {
    this.filters.update(f => ({ ...f, movementType }));
  }

  updateFilterDates(startDate?: Date, endDate?: Date) {
    this.filters.update(f => ({ ...f, startDate, endDate }));
  }

  clearFilters() {
    this.filters.set({});
  }

  remove(movement: MovementUnion) {
    const ok = confirm(`¿Estás seguro de eliminar este movimiento?`);
    if (!ok) return;

    this.movementService.delete(movement.id).subscribe({
      next: () => this.loadMovements(),
      error: (error) => {
        console.error('Error al eliminar movimiento:', error);
        alert('Error al eliminar el movimiento');
      }
    });
  }

  // Método para formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMovementTypeInfo(movement: MovementUnion): { value: MovementType; label: string; icon: string } | undefined {
    const type = this.getMovementType(movement);
    return this.movementTypes().find(t => t.value === type);
  }

  getProductName(movement: MovementUnion): string {
    if (!movement.productId) return 'N/A';
    const product = this.products().find(p => p.id === movement.productId);
    return product?.name || 'N/A';
  }
}