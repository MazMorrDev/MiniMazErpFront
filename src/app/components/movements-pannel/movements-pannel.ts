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
import { MovementsService } from '../../services/movements.service'; // <-- NUEVO

// Interfaces
import { Product } from '../../interfaces/inventory/product.dto';
import { Buy } from '../../interfaces/movements/buy.dto';
import { Sell } from '../../interfaces/movements/sell.dto';
import { Expense } from '../../interfaces/movements/expense.dto';
import { Inventory } from '../../interfaces/inventory/inventory.dto';
import { Movement } from '../../interfaces/movements/movement.dto'; // <-- NUEVO

// Components
import { CreateMovementDialog } from '../create-movement-dialog/create-movement-dialog';

// Tipo actualizado para movimientos enriquecidos
interface EnrichedMovement extends Movement {
  _type: 'BUY' | 'SELL' | 'EXPENSE';
  unitPrice?: number;
  sellPrice?: number;
  expenseType?: string;
  totalPrice?: number;
}

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
  private readonly movementsService = inject(MovementsService); // <-- NUEVO
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();

  // Signals
  readonly products = signal<Product[]>([]);
  readonly inventories = signal<Inventory[]>([]);
  readonly allMovements = signal<EnrichedMovement[]>([]); // <-- CAMBIADO
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
      
      // 1. Obtener TODOS los movements primero (tienen inventoryId)
      const allMovements = await lastValueFrom(
        this.movementsService.getAll().pipe(takeUntil(this.destroy$))
      );

      console.log('Movements del MovementService:', allMovements?.length || 0);
      
      if (allMovements && allMovements.length > 0) {
        console.log('Primer movement del MovementService:', allMovements[0]);
        console.log('¿Tiene id?:', 'id' in allMovements[0], 'valor:', allMovements[0]?.id);
        console.log('¿Tiene inventoryId?:', 'inventoryId' in allMovements[0], 'valor:', allMovements[0]?.inventoryId);
      }

      // 2. Obtener buys, sells, expenses
      const [buys, sells, expenses] = await Promise.all([
        lastValueFrom(this.buyService.getAll().pipe(takeUntil(this.destroy$))),
        lastValueFrom(this.sellService.getAll().pipe(takeUntil(this.destroy$))),
        lastValueFrom(this.expenseService.getAll().pipe(takeUntil(this.destroy$)))
      ]);

      console.log('Buys recibidas:', buys?.length || 0);
      console.log('Sells recibidas:', sells?.length || 0);
      console.log('Expenses recibidas:', expenses?.length || 0);

      // 3. Crear mapa de movements por ID para acceso rápido
      const movementsMap = new Map<number, Movement>();
      if (allMovements) {
        allMovements.forEach(movement => {
          if (movement?.id) {
            movementsMap.set(movement.id, movement);
          }
        });
      }

      console.log('Movements en mapa:', movementsMap.size);

      // 4. Función para enriquecer datos
      const enrichData = (items: any[], type: MovementType): EnrichedMovement[] => {
        if (!items || items.length === 0) return [];
        
        return items.map(item => {
          const movementId = item.movementId || item.id;
          const movementData = movementsMap.get(movementId);
          
          // DEBUG: Ver qué estamos encontrando
          if (!movementData) {
            console.warn(`No se encontró movement para ${type} con ID:`, movementId);
            console.warn('Item completo:', item);
          }

          // Crear objeto enriquecido
          const enriched: EnrichedMovement = {
            // Campos base de Movement
            id: movementId,
            inventoryId: movementData?.inventoryId || item.inventoryId,
            description: movementData?.description || item.description,
            quantity: movementData?.quantity || item.quantity,
            movementDate: movementData?.movementDate || item.movementDate,
            // Tipo
            _type: type,
            // Campos específicos según tipo
            ...item
          };

          return enriched;
        }).filter(item => item !== null);
      };

      // 5. Enriquecer cada tipo
      const enrichedBuys = enrichData(buys || [], 'BUY');
      const enrichedSells = enrichData(sells || [], 'SELL');
      const enrichedExpenses = enrichData(expenses || [], 'EXPENSE');

      // 6. Combinar todos
      const combinedMovements: EnrichedMovement[] = [
        ...enrichedBuys,
        ...enrichedSells,
        ...enrichedExpenses
      ];

      console.log('Total movimientos combinados:', combinedMovements.length);
      
      if (combinedMovements.length > 0) {
        console.log('Primer movimiento enriquecido:', combinedMovements[0]);
        console.log('¿Tiene id?:', 'id' in combinedMovements[0], 'valor:', combinedMovements[0].id);
        console.log('¿Tiene inventoryId?:', 'inventoryId' in combinedMovements[0], 'valor:', combinedMovements[0].inventoryId);
        console.log('¿Tiene _type?:', '_type' in combinedMovements[0], 'valor:', combinedMovements[0]._type);
      }

      // 7. Guardar para debug
      this.debugData.set({
        rawMovements: allMovements,
        rawBuys: buys,
        rawSells: sells,
        rawExpenses: expenses,
        enrichedMovements: combinedMovements,
        movementsMapSize: movementsMap.size
      });

      // 8. Ordenar y guardar
      this.sortMovementsByDate(combinedMovements);
      this.allMovements.set(combinedMovements);

    } catch (error) {
      console.error('Error detallado cargando movimientos:', error);
      this.showErrorMessage('Error al cargar movimientos');
    } finally {
      this.isLoading.set(false);
    }
  }

  private sortMovementsByDate(movements: EnrichedMovement[]): void {
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

  async remove(movement: EnrichedMovement): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este movimiento?')) return;

    this.isLoading.set(true);
    const movementId = movement.id;

    try {
      // Usar el tipo para saber qué servicio llamar
      switch (movement._type) {
        case 'BUY':
          await lastValueFrom(this.buyService.delete(movementId).pipe(takeUntil(this.destroy$)));
          break;
        case 'SELL':
          await lastValueFrom(this.sellService.delete(movementId).pipe(takeUntil(this.destroy$)));
          break;
        case 'EXPENSE':
          await lastValueFrom(this.expenseService.delete(movementId).pipe(takeUntil(this.destroy$)));
          break;
        default:
          this.showWarningMessage('Tipo de movimiento no reconocido');
          return;
      }
      
      this.handleDeleteSuccess();
    } catch (error) {
      const errorMessage = movement._type === 'BUY' ? 'Error al eliminar compra' :
        movement._type === 'SELL' ? 'Error al eliminar venta' :
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

  // --- TYPE GUARDS (actualizadas) ---
  isBuy(movement: EnrichedMovement): boolean {
    return movement._type === 'BUY';
  }

  isExpense(movement: EnrichedMovement): boolean {
    return movement._type === 'EXPENSE';
  }

  isSell(movement: EnrichedMovement): boolean {
    return movement._type === 'SELL';
  }

  getMovementType(movement: EnrichedMovement): MovementType {
    return movement._type;
  }

  // --- UI DATA METHODS ---
  getProductName(movement: EnrichedMovement): string {
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

  getMovementTypeInfo(movement: EnrichedMovement): MovementTypeInfo {
    const type = movement._type;
    return this.movementTypes.find(t => t.value === type) || {
      value: type,
      label: type,
      icon: 'help'
    };
  }

  getMovementDetails(movement: EnrichedMovement): string {
    if (this.isBuy(movement)) {
      const unitPrice = (movement as any).unitPrice;
      if (typeof unitPrice === 'undefined') {
        return 'Precio no disponible';
      }
      const total = unitPrice * movement.quantity;
      return `Precio unitario: $${unitPrice.toFixed(2)} | Total: $${total.toFixed(2)}`;
    }

    if (this.isExpense(movement)) {
      const totalPrice = (movement as any).totalPrice;
      if (typeof totalPrice === 'undefined') {
        return 'Precio no disponible';
      }
      return `Total: $${totalPrice.toFixed(2)}`;
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
    
    // Probar el MovementService directamente
    this.movementsService.getAll().subscribe({
      next: (movements) => {
        console.log('✅ MovementService funciona! Movimientos:', movements.length);
        if (movements.length > 0) {
          console.log('Primer movimiento:', movements[0]);
        }
      },
      error: (error) => {
        console.error('❌ Error en MovementService:', error);
      }
    });
  }
}