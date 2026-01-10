import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
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
import { lastValueFrom, Subject, takeUntil } from 'rxjs';

// Services
import { ProductService } from '../../services/product.service';
import { BuyService } from '../../services/buy.service';
import { SellService } from '../../services/sell.service';
import { ExpenseService } from '../../services/expense.service';
import { InventoryService } from '../../services/inventory.service';

// Interfaces
import { Product } from '../../interfaces/inventory/product.dto';
import { Buy } from '../../interfaces/movements/buy.dto';
import { Sell } from '../../interfaces/movements/sell.dto';
import { Expense } from '../../interfaces/movements/expense.dto';
import { Inventory } from '../../interfaces/inventory/inventory.dto';

// Components
import { CreateMovementDialog } from '../create-movement-dialog/create-movement-dialog';

type MovementUnion = Buy | Sell | Expense;
type MovementType = 'BUY' | 'SELL' | 'EXPENSE';

interface MovementTypeInfo {
  value: MovementType;
  label: string;
  icon: string;
}

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
export class MovementsPannel implements OnInit, OnDestroy {
  // Services
  private readonly productService = inject(ProductService);
  private readonly buyService = inject(BuyService);
  private readonly inventoryService = inject(InventoryService);
  private readonly sellService = inject(SellService);
  private readonly expenseService = inject(ExpenseService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();

  // Signals
  readonly products = signal<Product[]>([]);
  readonly inventories = signal<Inventory[]>([]);
  readonly allMovements = signal<MovementUnion[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  // Debug signal
  readonly debugData = signal<any>(null);

  // Constants
  readonly movementTypes: MovementTypeInfo[] = [
    { value: 'BUY', label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL', label: 'Venta', icon: 'point_of_sale' },
    { value: 'EXPENSE', label: 'Gasto', icon: 'payments' }
  ];

  readonly displayedColumns = signal<string[]>([
    'date', 'product', 'type', 'description', 'quantity', 'details', 'actions'
  ]);

  // Computed signals
  readonly filteredMovements = computed(() => {
    const movements = this.allMovements();
    const query = this.searchQuery().toLowerCase();

    if (!query) return movements;

    return movements.filter(movement => {
      const productName = this.getProductName(movement).toLowerCase();
      const description = (movement.description || '').toLowerCase();

      return productName.includes(query) || description.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- MAIN METHODS ---
  private async loadInitialData(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Cargar inventarios y productos primero
      await Promise.all([
        this.loadInventories(),
        this.loadProducts()
      ]);
      
      // Luego cargar movimientos
      await this.loadAllMovements();
      
    } catch (error) {
      console.error('Error en loadInitialData:', error);
      this.showErrorMessage('Error al cargar datos iniciales');
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (products) => {
            console.log('Productos cargados:', products.length, 'primer producto:', products[0]);
            this.products.set(products);
            resolve();
          },
          error: (error) => {
            console.error('Error cargando productos:', error);
            this.showErrorMessage('Error al cargar productos');
            reject(error);
          }
        });
    });
  }

  private loadInventories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.inventoryService.getAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (inventories) => {
            console.log('Inventarios cargados:', inventories.length, 'primer inventario:', inventories[0]);
            this.inventories.set(inventories);
            resolve();
          },
          error: (error) => {
            console.error('Error cargando inventarios:', error);
            this.showErrorMessage('Error al cargar inventarios');
            reject(error);
          }
        });
    });
  }

  async loadAllMovements(): Promise<void> {
    this.isLoading.set(true);

    try {
      console.log('=== INICIANDO CARGA DE MOVIMIENTOS ===');
      
      // Obtener datos con debug
      const [buys, sells, expenses] = await Promise.all([
        lastValueFrom(this.buyService.getAll().pipe(takeUntil(this.destroy$))),
        lastValueFrom(this.sellService.getAll().pipe(takeUntil(this.destroy$))),
        lastValueFrom(this.expenseService.getAll().pipe(takeUntil(this.destroy$)))
      ]);

      console.log('Buys recibidas:', buys);
      console.log('Sells recibidas:', sells);
      console.log('Expenses recibidas:', expenses);

      // Validar que no sean undefined
      const validBuys = buys || [];
      const validSells = sells || [];
      const validExpenses = expenses || [];

      console.log(`Buys válidas: ${validBuys.length}`);
      console.log(`Sells válidas: ${validSells.length}`);
      console.log(`Expenses válidas: ${validExpenses.length}`);

      // Combinar movimientos
      const allMovements: MovementUnion[] = [
        ...validBuys,
        ...validSells,
        ...validExpenses
      ];

      console.log('Total movimientos combinados:', allMovements.length);
      
      if (allMovements.length > 0) {
        console.log('Primer movimiento combinado:', allMovements[0]);
        console.log('¿Tiene id?:', 'id' in allMovements[0], 'valor:', allMovements[0].id);
        console.log('¿Tiene inventoryId?:', 'inventoryId' in allMovements[0], 'valor:', allMovements[0].inventoryId);
      }

      // Guardar para debug
      this.debugData.set({
        buys: validBuys,
        sells: validSells,
        expenses: validExpenses,
        allMovements: allMovements
      });

      this.sortMovementsByDate(allMovements);
      this.allMovements.set(allMovements);

    } catch (error) {
      console.error('Error detallado cargando movimientos:', error);
      this.showErrorMessage('Error al cargar movimientos');
    } finally {
      this.isLoading.set(false);
    }
  }

  private sortMovementsByDate(movements: MovementUnion[]): void {
    movements.sort((a, b) =>
      new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
    );
  }

  // --- UI METHODS ---
  openAddMovementDialog(): void {
    const dialogRef = this.dialog.open(CreateMovementDialog, {
      width: '700px',
      data: { products: this.products() }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === 'success') {
          this.loadAllMovements();
          this.showSuccessMessage('Movimiento registrado exitosamente');
        }
      });
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  async remove(movement: MovementUnion): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este movimiento?')) return;

    this.isLoading.set(true);
    const movementId = movement.id;

    try {
      if (this.isBuy(movement)) {
        await lastValueFrom(this.buyService.delete(movementId).pipe(takeUntil(this.destroy$)));
        this.handleDeleteSuccess();
      } else if (this.isSell(movement)) {
        await lastValueFrom(this.sellService.delete(movementId).pipe(takeUntil(this.destroy$)));
        this.handleDeleteSuccess();
      } else if (this.isExpense(movement)) {
        await lastValueFrom(this.expenseService.delete(movementId).pipe(takeUntil(this.destroy$)));
        this.handleDeleteSuccess();
      } else {
        this.showWarningMessage('Tipo de movimiento no reconocido');
      }
    } catch (error) {
      const errorMessage = this.isBuy(movement) ? 'Error al eliminar compra' :
        this.isSell(movement) ? 'Error al eliminar venta' :
          'Error al eliminar gasto';
      this.handleError(errorMessage, error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- HELPER METHODS ---
  private handleDeleteSuccess(): void {
    this.showSuccessMessage('Movimiento eliminado exitosamente');
    this.loadAllMovements();
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    const errorDetail = error?.error?.message || error?.message || 'Error desconocido';
    this.showErrorMessage(`${message}: ${errorDetail}`);
  }

  // --- TYPE GUARDS ---
  isBuy(movement: MovementUnion): movement is Buy {
    return 'unitPrice' in movement && typeof (movement as Buy).unitPrice === 'number';
  }

  isExpense(movement: MovementUnion): movement is Expense {
    return 'expenseType' in movement && 'totalPrice' in movement;
  }

  isSell(movement: MovementUnion): movement is Sell {
    return !this.isBuy(movement) && !this.isExpense(movement);
  }

  getMovementType(movement: MovementUnion): MovementType {
    if (this.isBuy(movement)) return 'BUY';
    if (this.isSell(movement)) return 'SELL';
    return 'EXPENSE';
  }

  // --- UI DATA METHODS ---
  getProductName(movement: MovementUnion): string {
    // Si el movimiento no tiene datos, retornar placeholder
    if (!movement || typeof movement.id === 'undefined') {
      return 'Cargando...';
    }

    // Verificar que tenemos inventoryId
    if (typeof movement.inventoryId === 'undefined') {
      console.warn('Movimiento sin inventoryId:', movement);
      return 'Sin inventario';
    }

    const inventories = this.inventories();
    const products = this.products();

    // Si no hay datos cargados aún
    if (inventories.length === 0 || products.length === 0) {
      return 'Cargando datos...';
    }

    const inventory = inventories.find(inv => inv.id === movement.inventoryId);
    
    if (!inventory) {
      console.warn(`Inventario ${movement.inventoryId} no encontrado para movimiento ${movement.id}`);
      return `Inv#${movement.inventoryId}`;
    }

    const product = products.find(p => p.id === inventory.productId);
    
    if (!product) {
      console.warn(`Producto ${inventory.productId} no encontrado para inventario ${inventory.id}`);
      return `Prod#${inventory.productId}`;
    }

    return product.name;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha inválida';
    
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', dateString, error);
      return dateString;
    }
  }

  getMovementTypeInfo(movement: MovementUnion): MovementTypeInfo {
    const type = this.getMovementType(movement);
    return this.movementTypes.find(t => t.value === type) || {
      value: type,
      label: type,
      icon: 'help'
    };
  }

  getMovementDetails(movement: MovementUnion): string {
    if (this.isBuy(movement)) {
      const buy = movement as Buy;
      if (typeof buy.unitPrice === 'undefined') {
        return 'Precio no disponible';
      }
      const total = buy.unitPrice * buy.quantity;
      return `Precio unitario: $${buy.unitPrice.toFixed(2)} | Total: $${total.toFixed(2)}`;
    }

    if (this.isExpense(movement)) {
      const expense = movement as Expense;
      if (typeof expense.totalPrice === 'undefined') {
        return 'Precio no disponible';
      }
      return `Total: $${expense.totalPrice.toFixed(2)}`;
    }

    return `Cantidad: ${movement.quantity}`;
  }

  // --- SNACKBAR HELPERS ---
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['warning-snackbar']
    });
  }

  // --- DEBUG METHOD ---
  showDebugInfo(): void {
    const debug = this.debugData();
    console.log('=== DEBUG INFO ===');
    console.log('Debug data:', debug);
    console.log('Products signal:', this.products());
    console.log('Inventories signal:', this.inventories());
    console.log('Movements signal:', this.allMovements());
  }
}