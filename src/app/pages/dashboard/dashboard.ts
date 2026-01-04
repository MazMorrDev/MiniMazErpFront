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
import { ProductService } from '../inventory/services/product.service';
import { BuyService } from '../movements/services/buy.service';
import { SellService } from '../movements/services/sell.service';
import { ExpenseService } from '../movements/services/expense.service';
import { InventoryService } from '../inventory/services/inventory.service';
import { Product } from '../inventory/interfaces/product.dto';
import { Buy } from '../movements/interfaces/buy.dto';
import { Sell } from '../movements/interfaces/sell.dto';
import { Expense } from '../movements/interfaces/expense.dto';
import { Inventory } from '../inventory/interfaces/inventory.dto';
import { forkJoin } from 'rxjs';

// Interfaz unificada para movimientos en el dashboard
interface DashboardMovement {
  id: number;
  productId: number;
  description: string;
  quantity: number;
  movementDate: string;
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
    MatDividerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private productService = inject(ProductService);
  private buyService = inject(BuyService);
  private sellService = inject(SellService);
  private expenseService = inject(ExpenseService);
  private inventoryService = inject(InventoryService);

  // Signals for data
  products = signal<Product[]>([]);
  inventories = signal<Inventory[]>([]);
  movements = signal<DashboardMovement[]>([]);
  isLoading = signal(true);

  // Computed signals for dashboard metrics
  totalProducts = computed(() => this.products().length);

  totalMovements = computed(() => this.movements().length);

  recentMovements = computed(() =>
    this.movements()
      .sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime())
      .slice(0, 5)
  );

  stockSummary = computed(() => {
    const inventories = this.inventories();

    let totalStock = 0;
    let lowStockItems = 0;

    inventories.forEach(inventory => {
      const stock = inventory.stock;
      totalStock += stock;

      // Verificar si hay stock bajo basado en alertStock o un valor por defecto
      const alertThreshold = inventory.alertStock || 10;
      if (stock <= alertThreshold) {
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
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyMovements = movements.filter(m => new Date(m.movementDate) >= lastWeek);
    const monthlyMovements = movements.filter(m => new Date(m.movementDate) >= lastMonth);

    const ins = movements.filter(m => m.type === 'IN').length;
    const outs = movements.filter(m => m.type === 'OUT').length;

    return {
      weeklyCount: weeklyMovements.length,
      monthlyCount: monthlyMovements.length,
      ins,
      outs,
      insPercentage: movements.length > 0 ? Math.round((ins / movements.length) * 100) : 0
    };
  });

  displayedColumns = ['productName', 'stock', 'status'];

  constructor() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Cargar productos, inventarios y movimientos en paralelo
    forkJoin({
      products: this.productService.getAll(),
      inventories: this.inventoryService.getAll(),
      buys: this.buyService.getAll(),
      sells: this.sellService.getAll(),
      expenses: this.expenseService.getAll()
    }).subscribe({
      next: ({ products, inventories, buys, sells, expenses }) => {
        this.products.set(products);
        this.inventories.set(inventories);

        // Convertir todos los movimientos a DashboardMovement
        const allMovements: DashboardMovement[] = [
          ...buys.map(buy => ({
            id: buy.id,
            productId: buy.productId,
            description: buy.description || 'Compra',
            quantity: buy.quantity,
            movementDate: buy.movementDate,
            type: 'IN' as const
          })),
          ...sells.map(sell => ({
            id: sell.id,
            productId: sell.productId,
            description: sell.description || 'Venta',
            quantity: sell.quantity,
            movementDate: sell.movementDate,
            type: 'OUT' as const
          })),
          ...expenses.map(expense => ({
            id: expense.id,
            productId: expense.productId,
            description: expense.description || 'Gasto',
            quantity: expense.quantity,
            movementDate: expense.movementDate,
            type: 'EXPENSE' as const
          }))
        ];

        this.movements.set(allMovements);
        this.isLoading.set(false);
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

  // Obtener el inventario de un producto específico
  getProductInventory(productId: number): Inventory | undefined {
    return this.inventories().find(inv => inv.productId === productId);
  }

  // Obtener el stock de un producto
  getProductStock(productId: number): number {
    const inventory = this.getProductInventory(productId);
    return inventory ? inventory.stock : 0;
  }

  // Obtener el nombre del producto
  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Producto no encontrado';
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
}