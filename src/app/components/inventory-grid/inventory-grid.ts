import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-inventory_grid',
  templateUrl: './inventory-grid.html',
  styleUrls: ['./inventory-grid.css']
})
export class InventoryGridComponent implements OnInit {
  isLoading = signal(false);
  constructor() { }

  ngOnInit(): void {
    // load objects
  }
}
