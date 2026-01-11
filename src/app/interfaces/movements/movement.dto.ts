export interface Movement {
  id: number;
  inventoryId: number;
  description: string;
  quantity: number;
  movementDate: string; // ISO
  type?: 'IN' | 'OUT' | 'EXPENSE';
}
