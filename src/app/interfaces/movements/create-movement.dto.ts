export interface CreateMovementDto {
    inventoryId: number;        // AÑADIDO: requerido según C#
    productId: number;          // REQUERIDO: según C#
    quantity: number;           // REQUERIDO: según C#
    description?: string;       // OPCIONAL: según C# (MaxLength 225, nullable)
    movementDate: string;       // REQUERIDO: según C# (debe enviarse como ISO string)
}
