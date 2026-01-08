import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { BuyService } from '../../services/buy.service';
import { SellService } from '../../services/sell.service';
import { ExpenseService } from '../../services/expense.service';
import { Product } from '../../interfaces/inventory/product.dto';
import { Buy } from '../../interfaces/movements/buy.dto';
import { Sell } from '../../interfaces/movements/sell.dto';
import { Expense } from '../../interfaces/movements/expense.dto';
import { CreateMovementDialog } from '../create-movement-dialog/create-movement-dialog';
import { UpdateProductDialog } from '../update-product-dialog/update-product-dialog';

type MovementUnion = Buy | Sell | Expense;
type MovementType = 'BUY' | 'SELL' | 'EXPENSE';

@Component({
  standalone: true,
  selector: 'app-movement-pannel',
  imports: [
    CommonModule,
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
    MatTooltipModule
  ],
  templateUrl: './movements-pannel.html',
  styleUrl: './movements-pannel.scss'
})
export class MovementsPannel {
  private productService = inject(ProductService);
  private buyService = inject(BuyService);
  private sellService = inject(SellService);
  private expenseService = inject(ExpenseService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  products = signal<Product[]>([]);
  allMovements = signal<MovementUnion[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Filtros adicionales (opcionales)
  filters = signal<{
    productId?: number;
    movementType?: MovementType;
  }>({});

  // Computed signals
  filteredMovements = computed(() => {
    const movements = this.allMovements();
    const query = this.searchQuery().toLowerCase();
    const filter = this.filters();

    return movements.filter(movement => {
      // 1. Filtro de búsqueda
      if (query) {
        const productName = this.getProductName(movement).toLowerCase();
        const description = (movement.description || '').toLowerCase();
        const matchesSearch = productName.includes(query) || description.includes(query);
        if (!matchesSearch) return false;
      }

      // 2. Filtro por producto
      if (filter.productId && movement.productId !== filter.productId) {
        return false;
      }

      // 3. Filtro por tipo de movimiento
      if (filter.movementType) {
        const movementType = this.getMovementType(movement);
        if (movementType !== filter.movementType) {
          return false;
        }
      }

      return true;
    });
  });

  // Columnas de la tabla
  displayedColumns = signal<string[]>([
    'date',
    'product',
    'type',
    'description',
    'quantity',
    'details',
    'actions'
  ]);

  // Tipos para UI
  movementTypes = signal<{ value: MovementType, label: string, icon: string }[]>([
    { value: 'BUY', label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL', label: 'Venta', icon: 'point_of_sale' },
    { value: 'EXPENSE', label: 'Gasto', icon: 'payments' }
  ]);

  constructor() {
    this.loadProducts();
    this.loadAllMovements();
  }

  // --- MÉTODOS PRINCIPALES ---
  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadAllMovements() {
    this.isLoading.set(true);
    Promise.all([
      this.buyService.getAll().toPromise(),
      this.sellService.getAll().toPromise(),
      this.expenseService.getAll().toPromise()
    ]).then(([buys, sells, expenses]) => {
      const allMovements: MovementUnion[] = [
        ...(buys || []),
        ...(sells || []),
        ...(expenses || [])
      ];
      allMovements.sort((a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
      );
      this.allMovements.set(allMovements);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error cargando movimientos:', error);
      this.snackBar.open('Error al cargar movimientos', 'Cerrar', { duration: 3000 });
      this.isLoading.set(false);
    });
  }

  openAddMovementDialog() {
    const dialogRef = this.dialog.open(CreateMovementDialog, {
      width: '700px',
      data: {
        products: this.products()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadAllMovements();
        this.snackBar.open('Movimiento registrado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  remove(movement: MovementUnion) {
    if (!confirm('¿Está seguro de eliminar este movimiento?')) return;

    this.isLoading.set(true);
    const movementId = movement.id;

    if (this.isBuy(movement)) {
      this.buyService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error) => this.handleError('Error al eliminar compra', error)
      });
    } else if (this.isSell(movement)) {
      this.sellService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error) => this.handleError('Error al eliminar venta', error)
      });
    } else if (this.isExpense(movement)) {
      this.expenseService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error) => this.handleError('Error al eliminar gasto', error)
      });
    } else {
      this.snackBar.open('Tipo de movimiento no reconocido', 'Cerrar', { duration: 3000 });
      this.isLoading.set(false);
    }
  }

  // --- MÉTODOS DE AYUDA ---
  private handleDeleteSuccess() {
    this.snackBar.open('Movimiento eliminado exitosamente', 'Cerrar', { duration: 3000 });
    this.loadAllMovements();
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.snackBar.open(`${message}: ${error?.message || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
    this.isLoading.set(false);
  }

  getMovementType(movement: MovementUnion): MovementType {
    if (this.isBuy(movement)) return 'BUY';
    if (this.isSell(movement)) return 'SELL';
    return 'EXPENSE';
  }

  isBuy(movement: MovementUnion): movement is Buy {
    return (movement as Buy).unitPrice !== undefined;
  }

  isSell(movement: MovementUnion): movement is Sell {
    const hasBuyProperties = 'unitPrice' in movement;
    const hasExpenseProperties = 'expenseType' in movement && 'totalPrice' in movement;
    return !hasBuyProperties && !hasExpenseProperties && 'id' in movement;
  }

  isExpense(movement: MovementUnion): movement is Expense {
    return (movement as Expense).expenseType !== undefined;
  }

  getProductName(movement: MovementUnion): string {
    const product = this.products().find(p => p.id === movement.productId);
    return product?.name || 'N/A';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMovementTypeInfo(movement: MovementUnion) {
    const type = this.getMovementType(movement);
    return this.movementTypes().find(t => t.value === type) ?? {
      value: type,
      label: type,
      icon: 'help'
    };
  }

  getMovementDetails(movement: MovementUnion): string {
    if (this.isBuy(movement)) {
      return `Precio unitario: $${movement.unitPrice.toFixed(2)} | Total: $${(movement.unitPrice * movement.quantity).toFixed(2)}`;
    }
    if (this.isExpense(movement)) {
      return `Total: $${movement.totalPrice.toFixed(2)}`;
    }
    return `Cantidad: ${movement.quantity}`;
  }


}