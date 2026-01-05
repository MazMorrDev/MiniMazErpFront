// inventory-pannel.ts
import { Component, inject, OnInit } from '@angular/core';
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
import { InventoryService } from '../../services/inventory.service';
import { Inventory } from '../../interfaces/inventory/inventory.dto';
import { CreateProductDialog } from '../create-product-dialog/create-product-dialog';

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
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  
  inventories: Inventory[] = [];
  isLoading = false;
  searchQuery = '';
  
  displayedColumns: string[] = ['id', 'productId', 'clientId', 'stock', 'alertStock', 'warningStock'];
  
  ngOnInit(): void {
    this.loadInventories();
  }
  
  loadInventories(): void {
    this.isLoading = true;
    
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventories = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading inventories:', error);
        this.isLoading = false;
      }
    });
  }
  
  get filteredInventories() {
    if (!this.searchQuery) return this.inventories;
    
    return this.inventories.filter(inventory => 
      inventory.id.toString().includes(this.searchQuery) ||
      inventory.productId.toString().includes(this.searchQuery) ||
      inventory.stock.toString().includes(this.searchQuery)
    );
  }
  
  clearSearch(): void {
    this.searchQuery = '';
  }
  
  getStockColor(stock: number): string {
    if (stock === 0) return 'warn';
    if (stock < 10) return 'accent';
    return 'primary';
  }
  
  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(CreateProductDialog, {
      width: '500px',
      autoFocus: true
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si se creó un producto, recargar la tabla
        this.loadInventories();
      }
    });
  }
}