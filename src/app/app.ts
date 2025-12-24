import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { InventoryGridComponent } from "./components/inventory-grid/inventory_grid.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, InventoryGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('MiniMazErpFront');
}
