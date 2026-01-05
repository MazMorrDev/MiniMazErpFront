import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { UpdateProductDto } from '../../interfaces/inventory/update-product.dto';
import { Product } from '../../interfaces/inventory/product.dto';

@Component({
  selector: 'app-update-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './update-product-dialog.html',
  styleUrl: './update-product-dialog.scss',
})
export class UpdateProductDialog {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<UpdateProductDialog>);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { products: Product[] }) {
    this.form = this.fb.group({
      productId: [null, [Validators.required]],
      sellPrice: [null, [Validators.min(0)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.form.getRawValue();
    const productId = formValue.productId;

    if (!productId) {
      this.snackBar.open('Debe seleccionar un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    const updateProductDto: UpdateProductDto = {
      name: formValue.name,
      sellPrice: formValue.sellPrice || undefined
    };

    this.productService.update(productId, updateProductDto).subscribe({
      next: (response) => {
        this.snackBar.open('Producto actualizado exitosamente!', 'Cerrar', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error actualizando producto:', error);
        this.snackBar.open('Error actualizando producto. Por favor intente nuevamente.', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}
