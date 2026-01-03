import { ExpenseType } from "../enums/expense-type";
import { Movement } from "./movement";

export interface Expense extends Movement{
    expenseType: ExpenseType;
    totalPrice: number;
}
