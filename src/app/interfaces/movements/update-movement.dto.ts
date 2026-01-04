export interface UpdateMovementDto {
    inventoryId: number;        // AÑADIDO: requerido según C#
    productId: number;          // AÑADIDO: era solo productId, pero también es requerido
    quantity?: number;          // OPCIONAL: correcto para update
    description?: string;       // OPCIONAL: correcto
    movementDate?: string;      // OPCIONAL: ? añadido (en C# es requerido pero para update puede ser opcional)
}
