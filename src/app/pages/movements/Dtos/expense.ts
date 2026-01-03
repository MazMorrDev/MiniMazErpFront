import { ExpenseType } from "../enums/expense-type";
import { Movement } from "../../login/Dtos/movement";

export interface Expense extends Movement{
    expenseType: ExpenseType;
    totalPrice: number;
}
