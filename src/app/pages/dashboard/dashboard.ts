import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { Product } from '../../interfaces/inventory/product.dto';
import { Inventory } from '../../interfaces/inventory/inventory.dto';
import { forkJoin } from 'rxjs';
import { MovementsService } from '../../services/movements.service';
import { Movement } from '../../interfaces/movements/movement.dto';

// Interfaz extendida para el dashboard
interface DashboardMovement extends Movement {
  type: 'IN' | 'OUT' | 'EXPENSE';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPage {
  private productService = inject(ProductService);
  private inventoryService = inject(InventoryService);
  private movementService = inject(MovementsService);

  // Signals for data
  products = signal<Product[]>([]);
  inventories = signal<Inventory[]>([]);
  movements = signal<DashboardMovement[]>([]);
  isLoading = signal(true);

  // Column definitions
  recentMovementsColumns = ['productName', 'description', 'type', 'quantity', 'date'];
  stockColumns = ['productName', 'stock', 'status'];

  // Computed signals for dashboard metrics
  totalProducts = computed(() => this.products().length);

  totalMovements = computed(() => this.movements().length);

  recentMovements = computed(() => {
    const movements = this.movements();
    // Ordenar por fecha de forma descendente y tomar los primeros 5
    return [...movements]
      .sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime())
      .slice(0, 5);
  });

  stockSummary = computed(() => {
    const inventories = this.inventories();

    let totalStock = 0;
    let lowStockItems = 0;
    const lowStockThreshold = 10;

    inventories.forEach(inventory => {
      const stock = inventory.stock;
      totalStock += stock;

      if (stock < lowStockThreshold && stock > 0) {
        lowStockItems++;
      }
    });

    return {
      totalStock,
      lowStockItems,
      avgStock: inventories.length > 0 ? Math.round(totalStock / inventories.length) : 0
    };
  });

  movementStats = computed(() => {
    const movements = this.movements();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Para "este mes" (mes actual)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999); // Fin del día

    // Para "últimos 7 días"
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6); // Incluyendo hoy (7 días en total)
    lastWeek.setHours(0, 0, 0, 0);

    const weeklyMovements = movements.filter(m => {
      try {
        const movementDate = new Date(m.movementDate);
        return movementDate >= lastWeek && movementDate <= today;
      } catch (error) {
        return false;
      }
    });

    const monthlyMovements = movements.filter(m => {
      try {
        const movementDate = new Date(m.movementDate);
        return movementDate >= firstDayOfMonth && movementDate <= lastDayOfMonth;
      } catch (error) {
        return false;
      }
    });

    const ins = movements.filter(m => m.type === 'IN').length;
    const outs = movements.filter(m => m.type === 'OUT').length;
    const total = ins + outs;

    return {
      weeklyCount: weeklyMovements.length,
      monthlyCount: monthlyMovements.length,
      ins,
      outs,
      insPercentage: total > 0 ? Math.round((ins / total) * 100) : 0
    };
  });

  displayedColumns = ['productName', 'stock', 'status'];

  constructor() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Cargar todos los datos necesarios
    forkJoin({
      products: this.productService.getAll(),
      inventories: this.inventoryService.getAll(),
      movements: this.movementService.getAll()
    }).subscribe({
      next: ({ products, inventories, movements }) => {
        this.products.set(products);
        this.inventories.set(inventories);
        
        // Obtener tipos específicos de movimientos para determinar el tipo
        this.loadMovementTypes(movements);
      },
      error: (error) => {
        console.error('Error cargando datos del dashboard:', error);
        this.products.set([]);
        this.inventories.set([]);
        this.movements.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private loadMovementTypes(movements: Movement[]) {
    // Cargar todos los tipos de movimientos en paralelo
    forkJoin({
      buys: this.movementService.getAllBuys(),
      sells: this.movementService.getAllSells(),
    }).subscribe({
      next: ({ buys, sells }) => {
        // Crear arrays de IDs para cada tipo
        const buyIds = new Set(buys.map(buy => buy.id));
        const sellIds = new Set(sells.map(sell => sell.id));

        // Mapear los movimientos con sus tipos
        const typedMovements: DashboardMovement[] = movements.map(movement => {
          let type: 'IN' | 'OUT' | 'EXPENSE';
          
          if (buyIds.has(movement.id)) {
            type = 'IN';
          } else if (sellIds.has(movement.id)) {
            type = 'OUT';
          } else {
            // Por defecto, intentar determinar por cantidad/descripción
            type = this.determineMovementType(movement);
          }

          return {
            ...movement,
            type
          };
        });

        this.movements.set(typedMovements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error determinando tipos de movimientos:', error);
        // Si hay error, asignar tipos por defecto
        const typedMovements: DashboardMovement[] = movements.map(movement => ({
          ...movement,
          type: this.determineMovementType(movement)
        }));
        this.movements.set(typedMovements);
        this.isLoading.set(false);
      }
    });
  }

  private determineMovementType(movement: Movement): 'IN' | 'OUT' | 'EXPENSE' {
    // Lógica para determinar el tipo basado en descripción o cantidad
    const description = movement.description?.toLowerCase() || '';
    
    if (description.includes('compra') || description.includes('entrada') || description.includes('buy')) {
      return 'IN';
    } else if (description.includes('venta') || description.includes('salida') || description.includes('sell')) {
      return 'OUT';
    } else if (description.includes('gasto') || description.includes('expense')) {
      return 'EXPENSE';
    }
    
    // Por defecto, basado en el contexto de la aplicación
    // Si normalmente las compras aumentan stock y las ventas disminuyen,
    // pero necesitas más información para esto
    return 'OUT'; // O algún valor por defecto
  }

  // Obtener el nombre del producto
  getProductName(movement: DashboardMovement): string {
    if (!movement) return 'Producto no encontrado';

    // Buscar el inventario para obtener el productId
    if (movement.inventoryId) {
      const inventory = this.inventories().find(inv => inv.id === movement.inventoryId);
      if (inventory) {
        const product = this.products().find(p => p.id === inventory.productId);
        return product ? product.name : `Producto #${inventory.productId}`;
      }
      return `Inventario #${movement.inventoryId}`;
    }

    return 'Sin producto asociado';
  }

  // Obtener inventarios con información del producto para la tabla
  getInventoriesWithProductInfo() {
    const products = this.products();
    const inventories = this.inventories();

    return inventories.map(inventory => {
      const product = products.find(p => p.id === inventory.productId);
      return {
        ...inventory,
        productName: product ? product.name : 'Producto no encontrado'
      };
    });
  }

  getProductStatus(stock: number): string {
    if (stock === 0) return 'Sin Stock';
    if (stock < 10) return 'Stock Bajo';
    if (stock < 50) return 'Stock Medio';
    return 'Stock Alto';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Sin Stock': return 'warn';
      case 'Stock Bajo': return 'accent';
      case 'Stock Medio': return 'primary';
      case 'Stock Alto': return 'primary';
      default: return '';
    }
  }

  refresh() {
    this.loadData();
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'warn';
    if (stock < 10) return 'accent';
    return 'primary';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  }
}