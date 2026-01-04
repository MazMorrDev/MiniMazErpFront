export interface UpdateProductDto {
    name: string;           // REQUERIDO: según C# (aunque es update, en C# es required)
    sellPrice?: number;     // OPCIONAL: según C#
}
