import { CreateMovementDto } from "./create-movement.dto";

export interface CreateExpenseDto extends CreateMovementDto{
    totalPrice: number;
    expenseType: string;
}
