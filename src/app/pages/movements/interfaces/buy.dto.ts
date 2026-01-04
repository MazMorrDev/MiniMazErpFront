import { Movement } from "./movement.dto";

export interface Buy extends Movement {
    unitPrice: number;
}
