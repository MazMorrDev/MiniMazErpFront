import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  imports: [
    NavbarComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './inventory-pannel.html',
  styleUrl: './inventory-pannel.scss',
})
export class Inventory {
  lowStockOnly: boolean = false;
  searchQuery: string = '';
}