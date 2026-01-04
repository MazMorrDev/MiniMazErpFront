import { CreateMovementDto } from "./create-movement.dto";

export interface CreateBuyDto extends CreateMovementDto{
    unitPrice: number;
    // Añade las otras propiedades según tu DTO en C#
    productId?: number;
    description: string;
    quantity: number;
    movementDate: string;
}
