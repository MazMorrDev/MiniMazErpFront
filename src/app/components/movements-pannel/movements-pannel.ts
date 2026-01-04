import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { BuyService } from '../../services/buy.service';
import { Product } from '../../interfaces/inventory/product.dto';
import { FormsModule } from '@angular/forms';
import { Buy } from '../../interfaces/movements/buy.dto';
import { Sell } from '../../interfaces/movements/sell.dto';
import { Expense } from '../../interfaces/movements/expense.dto';
import { SellService } from '../../services/sell.service';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType } from '../../enums/expense-type.enum';
import { CreateBuyDto } from '../../interfaces/movements/create-buy.dto';
import { CreateSellDto } from '../../interfaces/movements/create-sell.dto';
import { CreateExpenseDto } from '../../interfaces/movements/create-expense.dto';

// Tipo unión para todos los movimientos posibles
type MovementUnion = Buy | Sell | Expense;

// Tipo para discriminación
type MovementType = 'BUY' | 'SELL' | 'EXPENSE';

@Component({
  standalone: true,
  selector: 'app-movement-pannel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatRadioModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movements-pannel.html',
  styleUrl: './movements-pannel.scss'
})
export class MovementsPannel {
  private productService = inject(ProductService);
  private buyService = inject(BuyService);
  private sellService = inject(SellService);
  private expenseService = inject(ExpenseService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  products = signal<Product[]>([]);
  allMovements = signal<MovementUnion[]>([]);
  isLoading = signal(false);

  // Tipos de movimiento
  movementTypes = signal<{ value: MovementType, label: string, icon: string }[]>([
    { value: 'BUY', label: 'Compra', icon: 'shopping_cart' },
    { value: 'SELL', label: 'Venta', icon: 'point_of_sale' },
    { value: 'EXPENSE', label: 'Gasto', icon: 'payments' }
  ]);

  expenseTypes = signal<{ value: ExpenseType, label: string }[]>([
    { value: ExpenseType.RENT, label: 'Alquiler' },
    { value: ExpenseType.UTILITIES, label: 'Servicios' },
    { value: ExpenseType.SALARIES, label: 'Sueldos' },
    { value: ExpenseType.MAINTENANCE, label: 'Mantenimiento' },
    { value: ExpenseType.OTHER, label: 'Otros' }
  ]);

  // Filtros
  filters = signal<{
    productId?: number;
    movementType?: MovementType;
    startDate?: Date;
    endDate?: Date;
  }>({});

  // Computed signal for filtered movements
  filteredMovements = computed(() => {
    const movements = this.allMovements();
    const filter = this.filters();

    return movements.filter(movement => {
      // Filtrar por producto
      if (filter.productId && movement.productId !== filter.productId) {
        return false;
      }

      // Filtrar por tipo de movimiento
      if (filter.movementType) {
        const movementType = this.getMovementType(movement);
        if (movementType !== filter.movementType) {
          return false;
        }
      }

      // Filtrar por fecha
      if (filter.startDate || filter.endDate) {
        const movementDate = new Date(movement.movementDate);

        if (filter.startDate && movementDate < filter.startDate) {
          return false;
        }

        if (filter.endDate && movementDate > filter.endDate) {
          return false;
        }
      }

      return true;
    });
  });

  // Estadísticas computadas - CORREGIDO
  movementStats = computed(() => {
    const movements = this.allMovements();

    const buys = movements.filter(m => this.isBuy(m)) as Buy[];
    const sells = movements.filter(m => this.isSell(m)) as Sell[];
    const expenses = movements.filter(m => this.isExpense(m)) as Expense[];

    const totalBuysAmount = buys.reduce((sum, buy) => {
      return sum + (buy.unitPrice * buy.quantity);
    }, 0);

    const totalSellsAmount = sells.reduce((sum, sell) => {
      // Si Sell no tiene precio de venta en el DTO actual, podrías necesitar ajustar esto
      return sum + sell.quantity; // Ajustar según tu modelo real
    }, 0);

    const totalExpensesAmount = expenses.reduce((sum, expense) => {
      return sum + expense.totalPrice;
    }, 0);

    return {
      totalBuys: buys.length,
      totalSells: sells.length,
      totalExpenses: expenses.length,
      totalBuysAmount,
      totalExpensesAmount,
      totalItemsSold: totalSellsAmount
    };
  });

  // Columnas dinámicas según tipo de movimiento
  displayedColumns = signal<string[]>([
    'date',
    'product',
    'type',
    'description',
    'quantity',
    'details',
    'actions'
  ]);

  // Formulario reactivo con controles dinámicos
  form = this.fb.group({
    movementType: ['BUY' as MovementType, Validators.required],
    inventoryId: [1, [Validators.required, Validators.min(1)]], // AÑADIDO: requerido por backend
    productId: [null as number | null, Validators.required],
    description: [''],
    quantity: [1, [Validators.required, Validators.min(1)]],
    movementDate: [new Date(), Validators.required],

    // Campos específicos para COMPRA
    unitPrice: [0, [Validators.required, Validators.min(0)]],

    // Campos específicos para GASTO
    expenseType: [ExpenseType.OTHER as ExpenseType],
    totalPrice: [0, [Validators.required, Validators.min(0)]],

    // Campos específicos para VENTA
    salePrice: [0, [Validators.required, Validators.min(0)]],
    discountPercentage: [0, [Validators.min(0), Validators.max(100)]]
  });

  constructor() {
    this.loadProducts();
    this.loadAllMovements();

    // Observar cambios en el tipo de movimiento para mostrar/ocultar campos
    this.form.get('movementType')?.valueChanges.subscribe(type => {
      this.updateFormValidation(type as MovementType);
    });

    // Inicializar validaciones
    this.updateFormValidation('BUY');
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: (products: Product[]) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadAllMovements() {
    this.isLoading.set(true);

    // Cargar todos los tipos de movimientos en paralelo
    Promise.all([
      this.buyService.getAll().toPromise(),
      this.sellService.getAll().toPromise(),
      this.expenseService.getAll().toPromise()
    ]).then(([buys, sells, expenses]) => {
      const allMovements: MovementUnion[] = [
        ...(buys || []),
        ...(sells || []),
        ...(expenses || [])
      ];

      // Ordenar por fecha descendente
      allMovements.sort((a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
      );

      this.allMovements.set(allMovements);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error cargando movimientos:', error);
      this.snackBar.open('Error al cargar movimientos', 'Cerrar', { duration: 3000 });
      this.isLoading.set(false);
    });
  }
  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValue = this.form.value;
    const movementType = formValue.movementType as MovementType;

    // Validar que productId no sea null
    if (formValue.productId === null) {
      this.snackBar.open('Debe seleccionar un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    try {
      switch (movementType) {
        case 'BUY':
          const buyDto: CreateBuyDto = {
            inventoryId: formValue.inventoryId!,
            productId: formValue.productId!,
            quantity: formValue.quantity!,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate!).toISOString(),
            unitPrice: formValue.unitPrice!
          };

          this.buyService.create(buyDto).subscribe({
            next: () => {
              this.snackBar.open('Compra registrada exitosamente', 'Cerrar', { duration: 3000 });
              this.loadAllMovements();
              this.resetForm();
            },
            error: (error: any) => this.handleError('Error al crear compra', error)
          });
          break;

        case 'SELL':
          const sellDto: CreateSellDto = {
            inventoryId: formValue.inventoryId!,
            productId: formValue.productId!,
            quantity: formValue.quantity!,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate!).toISOString(),
            salePrice: formValue.salePrice!,
            discountPercentage: formValue.discountPercentage ?? undefined  // CORREGIDO
          };

          this.sellService.create(sellDto).subscribe({
            next: () => {
              this.snackBar.open('Venta registrada exitosamente', 'Cerrar', { duration: 3000 });
              this.loadAllMovements();
              this.resetForm();
            },
            error: (error: any) => this.handleError('Error al crear venta', error)
          });
          break;

        case 'EXPENSE':
          const expenseDto: CreateExpenseDto = {
            inventoryId: formValue.inventoryId!,
            productId: formValue.productId!,
            quantity: formValue.quantity!,
            description: formValue.description || '',
            movementDate: new Date(formValue.movementDate!).toISOString(),
            totalPrice: formValue.totalPrice!,
            expenseType: formValue.expenseType!
          };

          this.expenseService.create(expenseDto).subscribe({
            next: () => {
              this.snackBar.open('Gasto registrado exitosamente', 'Cerrar', { duration: 3000 });
              this.loadAllMovements();
              this.resetForm();
            },
            error: (error: any) => this.handleError('Error al crear gasto', error)
          });
          break;
      }
    } catch (error: any) {
      this.handleError('Error al procesar el formulario', error);
    }
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.snackBar.open(`${message}: ${error?.message || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
    this.isLoading.set(false);
  }

  updateFormValidation(movementType: MovementType) {
    // Resetear todos los validadores primero
    this.form.get('unitPrice')?.clearValidators();
    this.form.get('totalPrice')?.clearValidators();
    this.form.get('expenseType')?.clearValidators();
    this.form.get('salePrice')?.clearValidators();
    this.form.get('discountPercentage')?.clearValidators();

    // Aplicar validadores según el tipo
    switch (movementType) {
      case 'BUY':
        this.form.get('unitPrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('unitPrice')?.enable();
        this.form.get('totalPrice')?.disable();
        this.form.get('expenseType')?.disable();
        this.form.get('salePrice')?.disable();
        this.form.get('discountPercentage')?.disable();
        break;

      case 'EXPENSE':
        this.form.get('totalPrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('expenseType')?.setValidators([Validators.required]);
        this.form.get('totalPrice')?.enable();
        this.form.get('expenseType')?.enable();
        this.form.get('unitPrice')?.disable();
        this.form.get('salePrice')?.disable();
        this.form.get('discountPercentage')?.disable();
        break;

      case 'SELL':
        this.form.get('salePrice')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('discountPercentage')?.setValidators([Validators.min(0), Validators.max(100)]);
        this.form.get('salePrice')?.enable();
        this.form.get('discountPercentage')?.enable();
        this.form.get('unitPrice')?.disable();
        this.form.get('totalPrice')?.disable();
        this.form.get('expenseType')?.disable();
        break;
    }

    // Actualizar validación
    this.form.get('unitPrice')?.updateValueAndValidity();
    this.form.get('totalPrice')?.updateValueAndValidity();
    this.form.get('expenseType')?.updateValueAndValidity();
    this.form.get('salePrice')?.updateValueAndValidity();
    this.form.get('discountPercentage')?.updateValueAndValidity();
  }

  resetForm() {
    this.form.reset({
      movementType: 'BUY',
      inventoryId: 1,
      productId: null,
      description: '',
      quantity: 1,
      movementDate: new Date(),
      unitPrice: 0,
      expenseType: ExpenseType.OTHER,
      totalPrice: 0,
      salePrice: 0,
      discountPercentage: 0
    });
    this.updateFormValidation('BUY');
  }

  // Métodos de ayuda para determinar tipos - CORREGIDOS
  getMovementType(movement: MovementUnion): MovementType {
    if (this.isBuy(movement)) return 'BUY';
    if (this.isSell(movement)) return 'SELL';
    if (this.isExpense(movement)) return 'EXPENSE';
    throw new Error('Tipo de movimiento desconocido');
  }

  // Métodos de ayuda para determinar tipos - MEJORADOS
  isBuy(movement: MovementUnion): movement is Buy {
    return (movement as Buy).unitPrice !== undefined;
  }

  isSell(movement: MovementUnion): movement is Sell {
    // Verificamos que NO tenga propiedades específicas de Buy o Expense
    const hasBuyProperties = 'unitPrice' in movement;
    const hasExpenseProperties = 'expenseType' in movement && 'totalPrice' in movement;
    return !hasBuyProperties && !hasExpenseProperties && 'id' in movement;
  }

  isExpense(movement: MovementUnion): movement is Expense {
    return (movement as Expense).expenseType !== undefined &&
      (movement as Expense).totalPrice !== undefined;
  }

  getMovementDetails(movement: MovementUnion): string {
    if (this.isBuy(movement)) {
      return `Precio unitario: $${movement.unitPrice.toFixed(2)} | Total: $${(movement.unitPrice * movement.quantity).toFixed(2)}`;
    }

    if (this.isExpense(movement)) {
      const expenseTypeLabel = this.expenseTypes().find(et => et.value === movement.expenseType)?.label || 'Otros';
      return `Tipo: ${expenseTypeLabel} | Total: $${movement.totalPrice.toFixed(2)}`;
    }

    if (this.isSell(movement)) {
      // Si Sell tiene salePrice en el futuro, puedes agregarlo aquí
      return `Cantidad: ${movement.quantity}`;
    }

    return '';
  }

  updateFilterProductId(productId: number | null | undefined) {
    this.filters.update(f => ({
      ...f,
      productId: productId !== null && productId !== undefined ? productId : undefined
    }));
  }

  updateFilterMovementType(movementType: MovementType | undefined) {
    this.filters.update(f => ({ ...f, movementType }));
  }

  updateFilterDates(startDate?: Date, endDate?: Date) {
    this.filters.update(f => ({ ...f, startDate, endDate }));
  }

  clearFilters() {
    this.filters.set({});
  }

  // Método para eliminar movimiento - COMPLETAMENTE REESCRITO
  remove(movement: MovementUnion) {
    if (!confirm(`¿Está seguro de eliminar este movimiento?`)) return;

    // Asegurarnos de que el movimiento tiene un ID
    const movementId = movement.id;
    if (!movementId) {
      this.snackBar.open('Movimiento no tiene ID válido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    // Determinar el tipo de movimiento usando discriminación
    if (this.isBuy(movement)) {
      // TypeScript ahora sabe que 'movement' es de tipo 'Buy'
      this.buyService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error: any) => this.handleError('Error al eliminar compra', error)
      });
    } else if (this.isSell(movement)) {
      // TypeScript ahora sabe que 'movement' es de tipo 'Sell'
      this.sellService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error: any) => this.handleError('Error al eliminar venta', error)
      });
    } else if (this.isExpense(movement)) {
      // TypeScript ahora sabe que 'movement' es de tipo 'Expense'
      this.expenseService.delete(movementId).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error: any) => this.handleError('Error al eliminar gasto', error)
      });
    } else {
      this.snackBar.open('Tipo de movimiento no reconocido', 'Cerrar', { duration: 3000 });
      this.isLoading.set(false);
    }
  }

  private handleDeleteSuccess() {
    this.snackBar.open('Movimiento eliminado exitosamente', 'Cerrar', { duration: 3000 });
    this.loadAllMovements();
  }

  // Método para formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMovementTypeInfo(movement: MovementUnion): { value: MovementType; label: string; icon: string } | undefined {
    const type = this.getMovementType(movement);
    return this.movementTypes().find(t => t.value === type);
  }

  getProductName(movement: MovementUnion): string {
    if (!movement.productId) return 'N/A';
    const product = this.products().find(p => p.id === movement.productId);
    return product?.name || 'N/A';
  }
}