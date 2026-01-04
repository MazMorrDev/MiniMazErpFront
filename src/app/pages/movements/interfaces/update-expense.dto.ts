import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateExpenseDto extends UpdateMovementDto{
    totalPrice?: number;
    expenseType?: string;
    // Añade las otras propiedades según tu DTO en C#
    description?: string;
    quantity?: number;
}
