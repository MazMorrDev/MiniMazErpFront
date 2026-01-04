export interface CreateExpenseDto {
    totalPrice: number;
    expenseType: string;
    // Añade las otras propiedades según tu DTO en C#
    productId?: number;
    description: string;
    quantity: number;
    movementDate: string;
}
