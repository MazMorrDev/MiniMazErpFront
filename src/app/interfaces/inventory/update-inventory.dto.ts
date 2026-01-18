export interface UpdateInventoryDto {
    userId: number;        // REQUERIDO: según C# (aunque es update, en C# es required)
    productId: number;       // REQUERIDO: según C#
    stock: number;           // REQUERIDO: según C#
}
