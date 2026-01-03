import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [ RouterLink, RouterLinkActive ]
})
export class NavbarComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
