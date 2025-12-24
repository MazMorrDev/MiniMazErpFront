import { Component, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { ProductService } from '../../services/prod.service';
import { Product } from '../../interfaces/products.interfaces';

@Component({
  selector: 'app-inventory_grid',
  templateUrl: './inventory_grid.component.html',
  styleUrls: ['./inventory_grid.component.css']
})
export class InventoryGridComponent implements OnInit {
  isLoading : WritableSignal<boolean> = signal(false);
  prodService = inject(ProductService);
  products : WritableSignal<Product[]> = signal<Product[]>([]);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.prodService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data as Product[]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.isLoading.set(false);
      }
    });
  }
}
