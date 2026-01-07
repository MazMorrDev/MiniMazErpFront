import { CreateMovementDto } from "./create-movement.dto";

export interface CreateBuyDto extends CreateMovementDto{
    unitPrice: number;
}
