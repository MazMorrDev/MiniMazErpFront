export interface CreateMovementDto {
    quantity: number;
    description?: string;
    movementDate: string;
    productId: number;
}
