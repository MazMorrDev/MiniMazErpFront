import { ExpenseType } from "./expense-type.enum";
import { Movement } from "./movement.dto";

export interface Expense extends Movement{
    expenseType: ExpenseType;
    totalPrice: number;
}
