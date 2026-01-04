import { ExpenseType } from "../enums/expense-type.enum";
import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateExpenseDto extends UpdateMovementDto {
    totalPrice?: number;
    expenseType?: ExpenseType;
}
