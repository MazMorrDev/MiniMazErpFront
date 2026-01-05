import { Component, Inject, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule, MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuyService } from '../../services/buy.service';
import { SellService } from '../../services/sell.service';
import { ExpenseService } from '../../services/expense.service';
import { Product } from '../../interfaces/inventory/product.dto';
import { ExpenseType } from '../../enums/expense-type.enum';
import { CreateBuyDto } from '../../interfaces/movements/create-buy.dto';
import { CreateSellDto } from '../../interfaces/movements/create-sell.dto';
import { CreateExpenseDto } from '../../interfaces/movements/create-expense.dto';

type MovementType = 'BUY' | 'SELL' | 'EXPENSE';

@Component({
  selector: 'app-movement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
  ],
  templateUrl: './create-movement-dialog.html',
  styleUrls: ['./create-movement-dialog.scss']
})
export class CreateMovementDialog implements OnInit {
  private fb = inject(FormBuilder);
  private buyService = inject(BuyService);
  private sellService = inject(SellService);
  private expenseService = inject(ExpenseService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CreateMovementDialog>);

  isLoading = signal(false);
  form!: FormGroup;

  movementTypes = [
    { value: 'BUY' as MovementType, label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL' as MovementType, label: 'Venta', icon: 'point_of_sale' },
    { value: 'EXPENSE' as MovementType, label: 'Gasto', icon: 'payments' }
  ];

  expenseTypes = [
    { value: ExpenseType.RENT, label: 'Alquiler' },
    { value: ExpenseType.UTILITIES, label: 'Servicios' },
    { value: ExpenseType.SALARIES, label: 'Sueldos' },
    { value: ExpenseType.MAINTENANCE, label: 'Mantenimiento' },
    { value: ExpenseType.OTHER, label: 'Otros' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { products: Product[] }) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeFormListeners();
  }

  initializeForm() {
    this.form = this.fb.group({
      movementType: ['BUY', [Validators.required]],
      inventoryId: [1, [Validators.required, Validators.min(1)]],
      productId: [null, [Validators.required]],
      description: ['', [Validators.maxLength(255)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      movementDate: [new Date(), [Validators.required]],
      
      // Campos condicionales - inicialmente deshabilitados
      unitPrice: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      expenseType: [{ value: ExpenseType.OTHER, disabled: true }, [Validators.required]],
      totalPrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      salePrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      discountPercentage: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]]
    });

    // Habilitar los campos según el tipo inicial
    this.updateFormControlsState('BUY');
  }

  initializeFormListeners() {
    this.form.get('movementType')?.valueChanges.subscribe((type: MovementType) => {
      if (type) {
        this.updateFormControlsState(type);
        this.updateValidators(type);
      }
    });

    // Forzar validación inicial
    this.form.updateValueAndValidity();
  }

  onMovementTypeChange(event: MatRadioChange) {
    const movementType = event.value as MovementType;
    this.updateFormControlsState(movementType);
    this.updateValidators(movementType);
  }

  updateFormControlsState(movementType: MovementType) {
    // Habilitar/deshabilitar campos según el tipo
    const controls = ['unitPrice', 'expenseType', 'totalPrice', 'salePrice', 'discountPercentage'];
    
    controls.forEach(control => {
      const formControl = this.form.get(control);
      if (formControl) {
        formControl.disable();
      }
    });

    switch (movementType) {
      case 'BUY':
        this.form.get('unitPrice')?.enable();
        break;
      case 'SELL':
        this.form.get('salePrice')?.enable();
        this.form.get('discountPercentage')?.enable();
        break;
      case 'EXPENSE':
        this.form.get('expenseType')?.enable();
        this.form.get('totalPrice')?.enable();
        break;
    }
  }

  updateValidators(movementType: MovementType) {
    // Limpiar validadores de todos los campos condicionales
    const conditionalControls = ['unitPrice', 'expenseType', 'totalPrice', 'salePrice', 'discountPercentage'];
    
    conditionalControls.forEach(control => {
      const formControl = this.form.get(control);
      if (formControl) {
        formControl.clearValidators();
        formControl.setValue(0);
        if (control === 'expenseType') {
          formControl.setValue(ExpenseType.OTHER);
        }
      }
    });

    // Agregar validadores según el tipo
    switch (movementType) {
      case 'BUY':
        this.form.get('unitPrice')?.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 'SELL':
        this.form.get('salePrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('discountPercentage')?.setValidators([Validators.min(0), Validators.max(100)]);
        break;
      case 'EXPENSE':
        this.form.get('expenseType')?.setValidators([Validators.required]);
        this.form.get('totalPrice')?.setValidators([Validators.required, Validators.min(0)]);
        break;
    }

    // Actualizar validez de los controles
    conditionalControls.forEach(control => {
      this.form.get(control)?.updateValueAndValidity();
    });

    // Actualizar validez del formulario
    this.form.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  
  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });

    if (this.form.invalid) {
      const errors = this.getFormErrors();
      this.snackBar.open(
        `Por favor complete los campos requeridos: ${errors.join(', ')}`, 
        'Cerrar', 
        { duration: 5000 }
      );
      return;
    }

    const formValue = this.form.getRawValue(); // Usar getRawValue para incluir campos deshabilitados
    const movementType = formValue.movementType as MovementType;

    if (!formValue.productId) {
      this.snackBar.open('Debe seleccionar un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    try {
      switch (movementType) {
        case 'BUY':
          const buyDto: CreateBuyDto = {
            inventoryId: formValue.inventoryId,
            productId: formValue.productId,
            quantity: formValue.quantity,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate).toISOString(),
            unitPrice: formValue.unitPrice
          };

          this.buyService.create(buyDto).subscribe({
            next: () => this.handleSuccess(),
            error: (error) => this.handleError('Error al crear compra', error)
          });
          break;

        case 'SELL':
          const sellDto: CreateSellDto = {
            inventoryId: formValue.inventoryId,
            productId: formValue.productId,
            quantity: formValue.quantity,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate).toISOString(),
            salePrice: formValue.salePrice,
            discountPercentage: formValue.discountPercentage || undefined
          };

          this.sellService.create(sellDto).subscribe({
            next: () => this.handleSuccess(),
            error: (error) => this.handleError('Error al crear venta', error)
          });
          break;

        case 'EXPENSE':
          const expenseDto: CreateExpenseDto = {
            inventoryId: formValue.inventoryId,
            productId: formValue.productId,
            quantity: formValue.quantity,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate).toISOString(),
            totalPrice: formValue.totalPrice,
            expenseType: formValue.expenseType
          };

          this.expenseService.create(expenseDto).subscribe({
            next: () => this.handleSuccess(),
            error: (error) => this.handleError('Error al crear gasto', error)
          });
          break;

        default:
          this.snackBar.open('Tipo de movimiento no válido', 'Cerrar', { duration: 3000 });
          this.isLoading.set(false);
          break;
      }
    } catch (error) {
      this.handleError('Error inesperado al procesar la solicitud', error);
    }
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.errors && control.touched) {
        if (control.errors['required']) {
          errors.push(this.getFieldLabel(key));
        }
      }
    });

    return errors;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      movementType: 'Tipo de Movimiento',
      inventoryId: 'ID de Inventario',
      productId: 'Producto',
      quantity: 'Cantidad',
      movementDate: 'Fecha',
      unitPrice: 'Precio Unitario',
      expenseType: 'Tipo de Gasto',
      totalPrice: 'Total Gasto',
      salePrice: 'Precio de Venta'
    };

    return labels[fieldName] || fieldName;
  }

  private handleSuccess(): void {
    this.isLoading.set(false);
    this.snackBar.open('Movimiento creado exitosamente', 'Cerrar', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.dialogRef.close(true);
  }

  private handleError(message: string, error: any): void {
    console.error('Error:', error);
    this.isLoading.set(false);
    
    const errorMessage = error?.error?.message || message;
    this.snackBar.open(errorMessage, 'Cerrar', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getProductName(productId: number): string {
    const product = this.data.products.find(p => p.id === productId);
    return product ? product.name : 'Producto no encontrado';
  }
}