import { Component, OnInit } from '@angular/core';
import { InventoryGridComponent } from "../../components/inventory-grid/inventory_grid.component";

@Component({
  selector: 'app-products-page',
  template: `
    <app-inventory_grid />
  `,
  styles: [``],
  imports: [InventoryGridComponent]
})
export class ProductsPageComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
