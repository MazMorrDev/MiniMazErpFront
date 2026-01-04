import { UpdateMovementDto } from "./update-movement.dto";

export interface UpdateSellDto extends UpdateMovementDto{
    // Define aquí las propiedades de UpdateSellDto según tu backend
    salePrice?: number;
    discountPercentage?: number;
    quantity?: number;
    description?: string;
    // ... otras propiedades según necesitesI
}
