import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegisterService } from '../../services/register.service';
import { Router, RouterModule } from '@angular/router';
import { RegisterRequest } from '../../interfaces/register/register-request';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  name: string = '';
  password: string = '';
  confirmPassword: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Si el usuario ya está logueado, redirigir al dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  // Validar fortaleza de contraseña
  checkPasswordStrength(): void {
    const length = this.password.length;
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasNumbers = /\d/.test(this.password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    let score = 0;
    if (length >= 6) score++;
    if (length >= 8) score++;
    if (hasUpperCase && hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    if (score <= 2) this.passwordStrength = 'weak';
    else if (score <= 4) this.passwordStrength = 'medium';
    else this.passwordStrength = 'strong';
  }

  // Validar formulario completo
  isFormValid(): boolean {
    const isValid =
      this.name.length >= 2 &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword

    return isValid;
  }

  onSubmit(): void {
    this.clearMessages();

    // Validación de contraseñas
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden. Por favor, verifica.';

      return;
    }

    // Validación básica del formulario
    if (!this.name || !this.password || this.password.length < 6) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';

      return;
    }



    const registerData: RegisterRequest = {
      name: this.name,
      password: this.password
    };

    this.registerService.register(registerData).subscribe({
      next: (response) => {


        this.isLoading = true;
        this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...';
        this.showMessage('¡Cuenta creada exitosamente!', 'success');


        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              registered: 'true',
              username: this.name
            }
          });
        }, 100);
      },
      error: (error: HttpErrorResponse) => {
        this.handleError('Error al registrar el usuario', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleError(baseMessage: string, error: HttpErrorResponse): void {

    let detailedMessage = baseMessage;
    let snackbarType: 'error' | 'warning' = 'error';

    switch (error.status) {
      case 0:
        detailedMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        break;

      case 400:
        if (error.error?.errors) {
          const validationErrors = error.error.errors;
          detailedMessage = 'Errores de validación:';
          Object.keys(validationErrors).forEach(key => {
            detailedMessage += `\n• ${validationErrors[key].join(', ')}`;
          });
        } else if (error.error?.message?.includes('already exists')) {
          detailedMessage = 'El nombre de usuario ya está en uso. Por favor, elige otro.';
          snackbarType = 'warning';
        } else {
          detailedMessage = error.error?.message || 'Solicitud incorrecta. Verifica los datos.';
        }

        break;

      case 409:
        detailedMessage = 'El nombre de usuario ya existe. Por favor, elige otro.';
        snackbarType = 'warning';
        break;

      case 500:
        detailedMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
        break;

      default:
        if (error.error?.message) {
          detailedMessage = error.error.message;
        }
        break;
    }

    this.errorMessage = detailedMessage;
    this.showMessage(detailedMessage, snackbarType);
    this.isLoading = false;
  }

  private showMessage(message: string, type: 'error' | 'success' | 'warning' = 'error'): void {
    const panelClass = type === 'success' ? 'success-snackbar' :
      type === 'warning' ? 'warning-snackbar' : 'error-snackbar';

    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}