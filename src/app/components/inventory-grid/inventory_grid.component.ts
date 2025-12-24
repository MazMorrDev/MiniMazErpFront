import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-inventory_grid',
  templateUrl: './inventory_grid.component.html',
  styleUrls: ['./inventory_grid.component.css']
})
export class InventoryGridComponent implements OnInit {
  isLoading = signal(false);
  constructor() { }

  ngOnInit(): void {
    // load objects
  }
}
