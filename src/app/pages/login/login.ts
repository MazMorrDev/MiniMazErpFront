import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../services/login.service';
import { LoginRequest } from '../../interfaces/login-request';
import { Router } from '@angular/router';

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
export class Login {
  name: string = '';
  password: string = '';
  hidePassword: boolean = true;

  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

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
