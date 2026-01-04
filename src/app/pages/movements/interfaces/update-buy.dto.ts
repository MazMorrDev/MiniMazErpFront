import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateBuyDto extends UpdateMovementDto{
    unitPrice?: number;
    // Añade las otras propiedades según tu DTO en C#
    description?: string;
    quantity?: number;
}
