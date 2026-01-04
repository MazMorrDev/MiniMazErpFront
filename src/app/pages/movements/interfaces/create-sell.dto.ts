import { CreateMovementDto } from "./create-movement.dto";

export interface CreateSellDto extends CreateMovementDto{
    salePrice: number;
    discountPercentage?: number;
}
