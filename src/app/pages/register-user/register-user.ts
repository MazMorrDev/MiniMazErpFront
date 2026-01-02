import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

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

  onSubmit(): void {
    if (this.name && this.password) {
      console.log('Login attempt with:', { name: this.name });
      // Aquí iría la lógica real de autenticación
      alert(`Login successful for: ${this.name}`);
    }
  }
}
