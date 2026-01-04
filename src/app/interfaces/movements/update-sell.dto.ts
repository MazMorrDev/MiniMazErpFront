import { UpdateMovementDto } from "../../components/movements-pannel/interfaces/update-movement.dto";

export interface UpdateSellDto extends UpdateMovementDto{
    salePrice?: number;
    discountPercentage?: number;
}
