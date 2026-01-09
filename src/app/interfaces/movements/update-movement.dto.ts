export interface UpdateMovementDto {
    inventoryId: number;    // Required en backend
    productId: number;      // Required en backend
    quantity?: number;
    description?: string;
    movementDate?: string;  // ISO 8601 string cuando se envía
}