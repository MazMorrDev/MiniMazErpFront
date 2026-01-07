import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar";
import { MovementsPannel } from "../../components/movements-pannel/movements-pannel";

@Component({
  selector: 'app-movements',
  imports: [NavbarComponent, MovementsPannel],
  templateUrl: './movements.html',
  styleUrl: './movements.scss',
})
export class Movements {

}
