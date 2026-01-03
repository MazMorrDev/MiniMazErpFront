export interface Movement {
  id: number;
  productId?: number;
  productName: string;
  quantity: number;
  date: string; // ISO
  notes?: string;
}
