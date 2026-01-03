export interface Movement {
  id: number;
  productId?: number;
  inventoryId?: number;
  description: string;
  quantity: number;
  movementDate: string; // ISO
}
