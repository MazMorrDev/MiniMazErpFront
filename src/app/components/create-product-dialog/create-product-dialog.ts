// create-product-dialog.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CreateProductDto } from '../../interfaces/inventory/create-product.dto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './create-product-dialog.html',
  styleUrl: './create-product-dialog.scss',
})
export class CreateProductDialog {
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<CreateProductDialog>);
  private snackBar = inject(MatSnackBar);

  productData: CreateProductDto = {
    name: '',
    sellPrice: undefined
  };

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave(): void {
    if (!this.productData.name.trim()) {
      return;
    }

    this.productService.create(this.productData).subscribe({
      next: (response) => {
        this.snackBar.open('Product created successfully!', 'Close', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.snackBar.open('Error creating product. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }
}