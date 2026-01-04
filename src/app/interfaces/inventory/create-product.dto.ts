export interface CreateProductDto {
    name: string;           // REQUERIDO: según C# [Required, MaxLength(40)]
    sellPrice?: number;     // OPCIONAL: según C#
}
