import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

// Services
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';

// Interfaces
import { Inventory } from '../../interfaces/inventory/inventory.dto';
import { Product } from '../../interfaces/inventory/product.dto';

// Components
import { UpdateProductDialog } from '../update-product-dialog/update-product-dialog';

interface InventoryWithProduct extends Inventory {
  product?: Product;
}

@Component({
  selector: 'app-inventory-pannel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './inventory-pannel.html',
  styleUrl: './inventory-pannel.scss',
})
export class InventoryPannel implements OnInit {
  // Services
  private readonly inventoryService = inject(InventoryService);
  private readonly productService = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Signals
  readonly inventories = signal<Inventory[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  readonly displayedColumns = signal<string[]>([
    'productId',
    'productName',
    'stock',
    'sellPrice'
  ]);

  // Computed signals
  readonly inventoriesWithProducts = computed<InventoryWithProduct[]>(() => {
    const inventories = this.inventories();
    const products = this.products();

    return inventories.map(inventory => {
      const product = products.find(p => p.id === inventory.productId);
      return {
        ...inventory,
        product
      };
    });
  });

  readonly filteredInventories = computed<InventoryWithProduct[]>(() => {
    const inventories = this.inventoriesWithProducts();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return inventories;

    return inventories.filter(inventory => {
      const productId = inventory.productId.toString();
      const productName = inventory.product?.name?.toLowerCase() || '';
      const stock = inventory.stock.toString();

      return productId.includes(query) ||
        productName.includes(query) ||
        stock.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    forkJoin({
      inventories: this.inventoryService.getAll(),
      products: this.productService.getAll()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ inventories, products }) => {
          this.inventories.set(inventories);
          this.products.set(products);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.isLoading.set(false);
          // Aquí podrías mostrar un snackbar de error
        }
      });
  }

  loadInventories(): void {
    this.loadData();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  getStockClass(stock: number): string {
    if (stock < 10) return 'stock-low';
    return 'stock-normal';
  }

  getProductName(inventory: InventoryWithProduct): string {
    return inventory.product?.name || `Producto ${inventory.productId}`;
  }

  getSellPrice(inventory: InventoryWithProduct): string {
    return inventory.product?.sellPrice
      ? `$${inventory.product.sellPrice.toFixed(2)}`
      : 'N/A';
  }

  openUpdateProductDialog(): void {
    const dialogRef = this.dialog.open(UpdateProductDialog, {
      width: '500px',
      autoFocus: true,
      data: {
        products: this.products(),
        inventories: this.inventories()
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result === 'updated') {
          this.loadData();
        }
      });
  }
}