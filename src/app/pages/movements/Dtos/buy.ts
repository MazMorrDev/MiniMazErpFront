import { Movement } from "../../login/Dtos/movement";

export interface Buy extends Movement {
    unitPrice: number;
}
