export interface Inventory {
    id: number;
    clientId: number;
    productId: number;
    stock: number;
    alertStock?: number;
    warningStock?: number;
}
