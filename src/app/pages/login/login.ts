import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginService } from '../../services/login.service';
import { LoginRequest } from '../../interfaces/login/login-request.dto';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage implements OnInit, OnDestroy {
  name: string = '';
  password: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loginService = inject(LoginService);
  private readonly snackBar = inject(MatSnackBar);
  private returnUrl: string = '/dashboard';
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loginService.logout();
    // Limpiar mensajes previos
    this.clearMessages();

    // Solo verificar en el navegador
    if (typeof window !== 'undefined') {
      if (this.loginService.isUserLoggedIn()) {
        this.router.navigate(['/dashboard']);
      }
    }

    // Suscribirse a parámetros de la URL
    const paramsSub = this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';

      if (params['expired'] === 'true') {
        this.errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }

      if (params['reason'] === 'auth_required') {
        this.errorMessage = 'Debes iniciar sesión para acceder a esta página.';
      }
    });

    this.subscriptions.add(paramsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.clearMessages();

    // Validación básica del formulario
    if (!this.name || !this.password || this.password.length < 6) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const loginData: LoginRequest = {
      name: this.name,
      password: this.password
    };

    const loginSub = this.loginService.login(loginData).subscribe({
      next: (response) => {
        // Validar estructura de la respuesta
        if (!response) {
          this.handleError('El servidor respondió con una respuesta vacía.', {
            status: 200,
            response: null
          });
          return;
        }

        if (!response.token) {
          this.handleError('El servidor no proporcionó un token en la respuesta.', {
            status: 200,
            response: response
          });
          return;
        }

        // Guardar el token
        this.loginService.saveToken(response);

        // Mostrar mensaje de éxito
        this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
        this.showMessage('¡Inicio de sesión exitoso!', 'success');

        // Redirigir después de un breve delay
        setTimeout(() => {
          this.isLoading = false; // Resetear loading antes de redirigir
          this.isLoading = true;
          this.router.navigateByUrl(this.returnUrl);
        }, 1);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false; // Resetear loading aquí también
        this.handleError('Error en el inicio de sesión', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    this.subscriptions.add(loginSub);
  }

  private handleError(baseMessage: string, error: any): void {
    if (error instanceof HttpErrorResponse) {
      let detailedMessage = baseMessage;
      let snackbarType: 'error' | 'warning' = 'error';

      switch (error.status) {
        case 0:
          detailedMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          break;

        case 400:
          detailedMessage = 'Solicitud incorrecta. Verifica los datos ingresados.';
          break;

        case 401:
          detailedMessage = 'Credenciales incorrectas. Verifica tu nombre y contraseña.';
          snackbarType = 'warning';
          break;

        case 403:
          detailedMessage = 'Acceso denegado. No tienes permiso para acceder.';
          break;

        case 404:
          detailedMessage = 'Endpoint no encontrado. Contacta al administrador.';
          break;

        case 500:
          detailedMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;

        default:
          if (error.error?.message) {
            detailedMessage = error.error.message;
          } else if (error.message) {
            detailedMessage = error.message;
          }
          break;
      }

      this.errorMessage = detailedMessage;
      this.showMessage(detailedMessage, snackbarType);

    } else {
      this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
      this.showMessage('Error inesperado', 'error');
    }
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