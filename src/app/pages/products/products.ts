import { Component } from '@angular/core';
import { ProductsListComponent } from './products-list';

@Component({
  standalone: true,
  selector: 'app-products',
  template: `
    <app-products-list></app-products-list>
  `,
  styles: [``],
  imports: [ProductsListComponent]
})
export class ProductsPageComponent {}
