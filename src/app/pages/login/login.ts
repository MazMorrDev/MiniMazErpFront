import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../services/login.service';
import { LoginRequest } from '../../interfaces/login/login-request.dto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  name: string = '';
  password: string = '';
  hidePassword: boolean = true;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loginService = inject(LoginService);
  private returnUrl: string = '/dashboard';

  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.loginService.isUserLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obtener returnUrl de los query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
  }

  onSubmit(): void {
    if (this.name && this.password) {
      const loginData: LoginRequest = {
        name: this.name,
        password: this.password
      }

      this.loginService.login(loginData).subscribe({
        next: (response) => {

          // Guarda el token
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          // Redirige al dashboard/home
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error("Error en login", error);
        }
      });
    }
  }
}
