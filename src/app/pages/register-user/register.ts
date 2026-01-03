import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { RegisterService } from './register.service';
import { Router } from '@angular/router';
import { RegisterRequest } from './register-request';

@Component({
  selector: 'app-register-user',
  imports: [
    MatInputModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './register-user.html',
  styleUrl: './register-user.scss',
})
export class RegisterUser {
  name: string = '';
  password: string = '';
  hidePassword: boolean = true;

  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (this.name && this.password) {
      const registerData: RegisterRequest = {
        name: this.name,
        password: this.password
      }

      this.registerService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error("Error al registrar el usuario", error);
        }
      })
    }
  }
}
