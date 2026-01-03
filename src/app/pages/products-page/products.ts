import { Component, OnInit } from '@angular/core';
import { InventoryGridComponent } from "../../components/inventory-grid/inventory_grid";

@Component({
  selector: 'app-products',
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
