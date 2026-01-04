export interface CreateInventoryDto {
    clientId: number;        // REQUERIDO: según C#
    productId: number;       // REQUERIDO: según C#
    stock: number;           // REQUERIDO: según C#
    alertStock?: number;     // OPCIONAL: según C#
    warningStock?: number;   // OPCIONAL: según C#
}
