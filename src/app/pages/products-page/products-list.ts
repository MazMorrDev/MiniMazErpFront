import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products">
      <h2>Products</h2>
      <button (click)="add()">Add Product</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of products()">
            <td>{{p.id}}</td>
            <td>{{p.name}}</td>
            <td>{{p.price}}</td>
            <td>{{p.quantity}}</td>
            <td>
              <button (click)="edit(p)">Edit</button>
              <button (click)="remove(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .products { padding: 12px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f6f6f6; }
    `
  ]
})
export class ProductsListComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.productService.list().subscribe({
      next: (data: Product[]) => this.products.set(data),
      error: () => this.products.set([]),
    });
  }

  add() {
    const name = prompt('Product name:');
    if (!name) return;
    const priceRaw = prompt('Price (numeric):');
    const price = priceRaw ? Number(priceRaw) : 0;
    const product: Product = { name, price };
    this.productService.create(product).subscribe({ next: () => this.load() });
  }

  edit(p: Product) {
    const name = prompt('Product name:', p.name);
    if (name == null) return;
    const priceRaw = prompt('Price (numeric):', p.price?.toString() || '0');
    const price = priceRaw ? Number(priceRaw) : 0;
    const updated: Product = { ...p, name, price };
    this.productService.update(p.id as number, updated).subscribe({ next: () => this.load() });
  }

  remove(p: Product) {
    const ok = confirm(`Delete product "${p.name}"?`);
    if (!ok || p.id == null) return;
    this.productService.delete(p.id).subscribe({ next: () => this.load() });
  }
}
