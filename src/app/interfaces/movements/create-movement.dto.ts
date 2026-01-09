export interface CreateMovementDto {
    inventoryId: number;
    productId: number;
    quantity: number;
    description?: string;
    movementDate: string; // ISO 8601 string
}