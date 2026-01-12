import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar";
import { InventoryPannel } from "../../components/inventory-pannel/inventory-pannel";

@Component({
  selector: 'app-inventory',
  imports: [NavbarComponent, InventoryPannel],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryPage {

}
