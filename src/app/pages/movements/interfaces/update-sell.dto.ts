import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateSellDto extends UpdateMovementDto{
    salePrice?: number;
    discountPercentage?: number;
}
