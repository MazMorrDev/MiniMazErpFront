import { CreateMovementDto } from "./create-movement.dto";

export interface CreateSellDto extends CreateMovementDto{
    // Define aquí las propiedades de CreateSellDto según tu backend
    salePrice: number;
    discountPercentage?: number;
    productId: number;
    quantity: number;
    description: string;
    movementDate: string;
    // ... otras propiedades según necesites
}
