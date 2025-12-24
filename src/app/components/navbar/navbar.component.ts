import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.compoent.html',
  styleUrls: ['./navbar.component.css'],
  imports: [ RouterLink, RouterLinkActive ]
})
export class NavbarComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
