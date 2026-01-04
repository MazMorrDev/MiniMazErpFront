import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateBuyDto extends UpdateMovementDto{
    unitPrice?: number;
}
