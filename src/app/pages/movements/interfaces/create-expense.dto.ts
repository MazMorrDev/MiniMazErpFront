import { CreateMovementDto } from "./create-movement.dto";

export interface CreateExpenseDto extends CreateMovementDto{
    totalPrice: number;
    expenseType: string;
    // Añade las otras propiedades según tu DTO en C#
    productId?: number;
    description: string;
    quantity: number;
    movementDate: string;
}
