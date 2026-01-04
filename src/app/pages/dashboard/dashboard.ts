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
import { ProductService } from '../inventory/product.service';
import { MovementService } from '../movements/movement.service';
import { Movement } from '../movements/movement.dto';
import { Inventory } from '../inventory/inventory.dto';
import { InventoryService } from '../inventory/inventory.service';

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
    MatChipsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private productService = inject(ProductService);
  private movementService = inject(MovementService);
  private inventoryService = inject(InventoryService)

  // Signals for data
  products = signal<Inventory[]>([]);
  movements = signal<Movement[]>([]);
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
    const products = this.products();
    const movements = this.movements();
    
    let totalStock = 0;
    let lowStockItems = 0;
    
    products.forEach(product => {
      const productMovements = movements.filter(m => m.productId === product.id);
      let currentStock = 0;
      
      /*
      productMovements.forEach(movement => {
        if (movement.type === 'IN') {
          currentStock += movement.quantity;
        } else if (movement.type === 'OUT') {
          currentStock -= movement.quantity;
        }
      });
      */

      totalStock += currentStock;
      if (currentStock < 10) { // Consider low stock if less than 10
        lowStockItems++;
      }
    });
    
    return {
      totalStock,
      lowStockItems,
      avgStock: products.length > 0 ? Math.round(totalStock / products.length) : 0
    };
  });

  movementStats = computed(() => {
    const movements = this.movements();
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentMovements = movements.filter(m => new Date(m.movementDate) >= lastWeek);
    const monthlyMovements = movements.filter(m => new Date(m.movementDate) >= lastMonth);
    
    const ins = movements.filter(m => m.type === 'IN').length;
    const outs = movements.filter(m => m.type === 'OUT').length;
    
    return {
      weeklyCount: recentMovements.length,
      monthlyCount: monthlyMovements.length,
      ins,
      outs,
      insPercentage: movements.length > 0 ? Math.round((ins / movements.length) * 100) : 0
    };
  });

  displayedColumns = ['productName', 'lastMovement', 'stock', 'status'];

  constructor() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    this.productService.list().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadMovements();
      },
      error: () => {
        this.products.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadMovements() {
    this.movementService.list().subscribe({
      next: (movements) => {
        this.movements.set(movements);
        this.isLoading.set(false);
      },
      error: () => {
        this.movements.set([]);
        this.isLoading.set(false);
      }
    });
  }

  getProductStock(productId: number): number {
    const productMovements = this.movements().filter(m => m.productId === productId);
    let stock = 0;
    
    productMovements.forEach(movement => {
      if (movement.type === 'IN') {
        stock += movement.quantity;
      } else if (movement.type === 'OUT') {
        stock -= movement.quantity;
      }
    });
    
    return Math.max(0, stock);
  }

  getProductLastMovement(productId: number): string {
    const productMovements = this.movements()
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return productMovements.length > 0 
      ? new Date(productMovements[0].date).toLocaleDateString() 
      : 'No movements';
  }

  getProductStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    if (stock < 50) return 'Medium Stock';
    return 'In Stock';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Out of Stock': return 'warn';
      case 'Low Stock': return 'accent';
      case 'Medium Stock': return 'primary';
      case 'In Stock': return 'primary';
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

