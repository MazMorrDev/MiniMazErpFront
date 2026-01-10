import { Movement } from "./movement.dto";

export interface Sell extends Movement {
    salePrice?: number;
    discountPercentage: number;
}
