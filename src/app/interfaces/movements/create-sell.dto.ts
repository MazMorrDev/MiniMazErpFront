import { CreateMovementDto } from "./create-movement.dto";

export interface CreateSellDto extends CreateMovementDto {
    salePrice: number;          // REQUERIDO: según C#
    discountPercentage?: number; // OPCIONAL: según C# (tiene Range validation)
}
