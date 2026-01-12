import { Component, Inject, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
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
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuyService } from '../../services/buy.service';
import { SellService } from '../../services/sell.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/inventory/product.dto';
import { CreateBuyDto } from '../../interfaces/movements/create-buy.dto';
import { CreateSellDto } from '../../interfaces/movements/create-sell.dto';
import { CreateProductDto } from '../../interfaces/inventory/create-product.dto';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { InventoryService } from '../../services/inventory.service';
import { Inventory } from '../../interfaces/inventory/inventory.dto';
import { CreateInventoryDto } from '../../interfaces/inventory/create-inventory.dto';
import { UpdateInventoryDto } from '../../interfaces/inventory/update-inventory.dto';
import { LoginService } from '../../services/login.service';
import { MovementsPannel } from '../movements-pannel/movements-pannel';

type MovementType = 'BUY' | 'SELL';
type ProductOption = 'EXISTING' | 'NEW';

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
    MatRadioModule,
    MatButtonToggleModule
  ],
  templateUrl: './create-movement-dialog.html',
  styleUrls: ['./create-movement-dialog.scss']
})
export class CreateMovementDialog implements OnInit {
  private fb = inject(FormBuilder);
  private buyService = inject(BuyService);
  private sellService = inject(SellService);
  private productService = inject(ProductService);
  private inventoryService = inject(InventoryService)
  private loginService = inject(LoginService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CreateMovementDialog>);

  // Signals principales (estado)
  isLoading = signal(false);
  products = signal<Product[]>([]);

  // Signals para estado del formulario (KISS - solo lo necesario)
  movementType = signal<MovementType>('BUY');
  productOption = signal<ProductOption>('EXISTING');

  // Signal para precio final (ejemplo de valor computado)
  finalPrice = computed(() => {
    if (this.movementType() !== 'SELL') return 0;

    const salePrice = this.form.get('salePrice')?.value || 0;
    const discount = this.form.get('discountPercentage')?.value || 0;
    return salePrice - (salePrice * discount / 100);
  });

  form!: FormGroup;

  // Controles para nuevo producto
  newProductNameControl = new FormControl('', [Validators.required, Validators.maxLength(40)]);
  newProductSellPriceControl = new FormControl(null as number | null, [Validators.min(0)]);

  movementTypes = [
    { value: 'BUY' as MovementType, label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL' as MovementType, label: 'Venta', icon: 'point_of_sale' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { products: Product[] }) {
    // Inicializar signals
    this.products.set(data.products);

    // Crear effect para reaccionar a cambios de movimientoType
    effect(() => {
      const type = this.movementType();
      if (type) {
        this.updateFormControlsState(type);
        this.updateValidators(type);
        const option = type === 'BUY' ? this.productOption() : 'EXISTING';
        this.updateProductValidators(type, option);
      }
    });

    // Effect para opción de producto
    effect(() => {
      const type = this.movementType();
      const option = this.productOption();

      if (type === 'BUY') {
        this.updateProductValidators(type, option);

        // Limpiar valores al cambiar opción
        if (option === 'NEW') {
          this.form.get('productId')?.setValue(null);
          this.newProductNameControl.setValue('');
          this.newProductSellPriceControl.setValue(null);
        } else {
          this.newProductNameControl.setValue('');
          this.newProductSellPriceControl.setValue(null);
        }
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.initializeFormListeners();
  }

  initializeForm() {
    this.form = this.fb.group({
      movementType: ['BUY', [Validators.required]],
      productOption: ['EXISTING' as ProductOption],
      inventoryId: [1, [Validators.required, Validators.min(1)]],
      productId: [null, []],
      description: ['', [Validators.maxLength(255)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      movementDate: [new Date(), [Validators.required]],

      // Campos condicionales
      unitPrice: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      totalPrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      salePrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      discountPercentage: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]]
    });

    // Sincronizar signals iniciales con el formulario
    this.updateFormControlsState('BUY');
    this.updateProductValidators('BUY', 'EXISTING');
  }

  initializeFormListeners() {
    // Escuchar cambios del formulario y actualizar signals
    this.form.get('movementType')?.valueChanges.subscribe((type: MovementType) => {
      this.movementType.set(type);
    });

    this.form.get('productOption')?.valueChanges.subscribe((option: ProductOption) => {
      this.productOption.set(option);
    });

    this.form.updateValueAndValidity();
  }

  onMovementTypeChange(event: MatRadioChange) {
    const movementType = event.value as MovementType;
    this.movementType.set(movementType);
    this.form.get('movementType')?.setValue(movementType);
  }

  onProductOptionChange(event: MatButtonToggleChange) {
    const productOption = event.value as ProductOption;
    this.productOption.set(productOption);
    this.form.get('productOption')?.setValue(productOption);
  }

  updateFormControlsState(movementType: MovementType) {
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
    }
  }

  updateValidators(movementType: MovementType) {
    const conditionalControls = ['unitPrice', 'expenseType', 'totalPrice', 'salePrice', 'discountPercentage'];

    conditionalControls.forEach(control => {
      const formControl = this.form.get(control);
      if (formControl) {
        formControl.clearValidators();
        formControl.setValue(0);
      }
    });

    switch (movementType) {
      case 'BUY':
        this.form.get('unitPrice')?.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 'SELL':
        this.form.get('salePrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('discountPercentage')?.setValidators([Validators.min(0), Validators.max(100)]);
        break;
    }

    conditionalControls.forEach(control => {
      this.form.get(control)?.updateValueAndValidity();
    });

    this.form.updateValueAndValidity();
  }

  updateProductValidators(movementType: MovementType, productOption: ProductOption = 'EXISTING') {
    const productControl = this.form.get('productId');

    if (movementType === 'BUY') {
      if (productOption === 'EXISTING') {
        // Para producto existente en compras: requerido
        productControl?.setValidators([Validators.required]);
        productControl?.enable();
      } else {
        // Para producto nuevo en compras: no requerido
        productControl?.clearValidators();
        productControl?.setValue(null);
        productControl?.disable();
      }
    } else {
      // Para ventas y gastos: siempre requerido
      productControl?.setValidators([Validators.required]);
      productControl?.enable();
    }

    productControl?.updateValueAndValidity();
  }

  isFormValid(): boolean {
    const movementType = this.movementType();
    const productOption = this.productOption();

    if (this.form.invalid) {
      return false;
    }

    // Validación especial para compras con producto nuevo
    if (movementType === 'BUY' && productOption === 'NEW') {
      return this.newProductNameControl.valid;
    }

    return true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Marcar todos los campos como tocados
    this.markAllAsTouched();

    if (!this.isFormValid()) {
      const errors = this.getFormErrors();
      this.snackBar.open(
        `Por favor complete los campos requeridos: ${errors.join(', ')}`,
        'Cerrar',
        { duration: 5000 }
      );
      return;
    }

    const formValue = this.form.getRawValue();
    const movementType = this.movementType();

    this.isLoading.set(true);

    try {
      this.processMovement(movementType, formValue);
    } catch (error) {
      this.handleError('Error inesperado al procesar la solicitud', error);
    }
  }

  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });

    this.newProductNameControl.markAsTouched();
    this.newProductSellPriceControl.markAsTouched();
  }

  private processMovement(movementType: MovementType, formValue: any): void {
    const movementDate = new Date(formValue.movementDate).toISOString();
    const productOption = this.productOption();

    if (movementType === 'BUY' && productOption === 'NEW') {
      // Crear producto nuevo antes de la compra

      this.createProductAndThenBuy(formValue, movementDate);
    } else {
      // Usar producto existente
      const productId = formValue.productId;
      if (!productId) {
        this.snackBar.open('Debe seleccionar un producto', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
        return;
      }
      this.executeMovement(movementType, formValue, productId, movementDate);
    }
  }

  private createProductAndThenBuy(formValue: any, movementDate: string): void {
    const createProductDto: CreateProductDto = {
      name: this.newProductNameControl.value || '',
      sellPrice: this.newProductSellPriceControl.value || undefined
    };

    this.productService.create(createProductDto).pipe(
      switchMap((newProduct: Product) => {
        // Buscar si ya existe inventario para este producto
        return this.findOrCreateInventory(newProduct.id, formValue.quantity).pipe(
          switchMap((inventory: Inventory) => {
            const buyDto: CreateBuyDto = {
              inventoryId: inventory.id, // ✅ Usar el ID del inventario
              quantity: formValue.quantity,
              description: formValue.description || '',
              movementDate: movementDate,
              unitPrice: formValue.unitPrice
            };

            return this.buyService.create(buyDto);
          })
        );
      }),
      catchError(error => {
        this.handleError('Error al crear producto, inventario o compra', error);
        return of(null);
      })
    ).subscribe({
      next: (result) => {
        if (result) {
          this.handleSuccess();
        }
      },
      error: (error) => this.handleError('Error en el proceso', error)
    });
  }

  private findOrCreateInventory(productId: number, initialStock: number): Observable<Inventory> {
    const clientId = this.loginService.getCurrentClientId();

    // Validar cliente ANTES de hacer cualquier operación
    if (!clientId) {
      this.snackBar.open('Usuario no autenticado. Por favor, inicie sesión.', 'Cerrar', { duration: 3000 });
      return throwError(() => new Error('Cliente no autenticado'));
    }

    return this.inventoryService.getAll().pipe(
      switchMap((inventories: Inventory[]) => {
        // Buscar inventario específico para este cliente y producto
        const existingInventory = inventories.find(inv =>
          inv.productId === productId && inv.clientId === clientId
        );

        if (existingInventory) {
          // Si existe, actualizar el stock
          const updateDto: UpdateInventoryDto = {
            clientId: clientId,
            productId: productId,
            stock: existingInventory.stock + initialStock
          };

          return this.inventoryService.update(existingInventory.id, updateDto).pipe(
            map(() => ({
              ...existingInventory,
              stock: existingInventory.stock + initialStock
            }))
          );
        } else {
          // Crear nuevo inventario
          const createDto: CreateInventoryDto = {
            clientId: clientId,
            productId: productId,
            stock: initialStock
          };

          return this.inventoryService.create(createDto);
        }
      }),
      catchError(error => {
        // Manejar error específico de "no encontrado" vs otros errores
        if (error.status === 404) {
          // No hay inventarios aún (primer producto)
          return this.createNewInventory(clientId, productId, initialStock);
        }

        this.handleError('Error al gestionar inventario', error);
        return throwError(() => error);
      })
    );
  }

  // Método auxiliar para crear inventario nuevo
  private createNewInventory(clientId: number, productId: number, stock: number): Observable<Inventory> {
    const createDto: CreateInventoryDto = {
      clientId: clientId,
      productId: productId,
      stock: stock
    };

    return this.inventoryService.create(createDto);
  }

  private executeMovement(movementType: MovementType, formValue: any, productId: number, movementDate: string): void {
    this.findOrCreateInventory(productId, formValue.quantity).pipe(
      switchMap((inventory: Inventory) => {
        const dto = this.createMovementDto(movementType, formValue, productId, movementDate, inventory.id);
        return this.callMovementService(movementType, dto);
      })
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError('Error al crear movimiento', error)
    });
  }

  private createMovementDto(
    movementType: MovementType,
    formValue: any,
    productId: number,
    movementDate: string,
    inventoryId: number
  ): any {
    switch (movementType) {
      case 'BUY':
        return {
          inventoryId: inventoryId,
          productId: productId,
          quantity: formValue.quantity,
          description: formValue.description || '',
          movementDate: movementDate,
          unitPrice: formValue.unitPrice
        };
      case 'SELL':
        return {
          inventoryId: inventoryId,
          productId: productId,
          quantity: formValue.quantity,
          description: formValue.description || '',
          movementDate: movementDate,
          salePrice: formValue.salePrice,
          discountPercentage: formValue.discountPercentage || undefined
        };
      default:
        throw new Error('Tipo de movimiento no válido');
    }
  }

  private callMovementService(movementType: MovementType, dto: any): Observable<any> {
    switch (movementType) {
      case 'BUY':
        return this.buyService.create(dto);
      case 'SELL':
        return this.sellService.create(dto);
      default:
        return throwError(() => new Error('Tipo de movimiento no válido'));
    }
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    const movementType = this.movementType();
    const productOption = this.productOption();

    // Errores del formulario principal
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.errors && control.touched) {
        if (control.errors['required']) {
          // Solo incluir productId si es requerido según el contexto
          if (key === 'productId') {
            if (movementType === 'BUY' && productOption === 'EXISTING') {
              errors.push('Producto');
            } else if (movementType !== 'BUY') {
              errors.push('Producto');
            }
          } else {
            errors.push(this.getFieldLabel(key));
          }
        }
      }
    });

    // Errores del producto nuevo (solo para compras con opción NEW)
    if (movementType === 'BUY' && productOption === 'NEW') {
      if (this.newProductNameControl.hasError('required') && this.newProductNameControl.touched) {
        errors.push('Nombre del Producto');
      }
      if (this.newProductNameControl.hasError('maxlength')) {
        errors.push('Nombre del Producto (máx. 40 caracteres)');
      }
    }

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
    this.isLoading.set(false);

    const errorMessage = error?.error?.message || message;
    this.snackBar.open(errorMessage, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Producto no encontrado';
  }
}


