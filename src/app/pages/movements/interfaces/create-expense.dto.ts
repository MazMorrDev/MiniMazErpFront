import { ExpenseType } from "../enums/expense-type.enum";
import { CreateMovementDto } from "./create-movement.dto";

export interface CreateExpenseDto extends CreateMovementDto{
    totalPrice: number;         // REQUERIDO: según C#
    expenseType: ExpenseType;   // REQUERIDO: según C# (enum, no string)
}
