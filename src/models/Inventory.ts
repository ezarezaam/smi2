import { Product } from './Product';

export interface Inventory {
  id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  location?: string;
  last_restock_date?: string | Date;
  min_stock_level?: number;
  created_at?: string;
  updated_at?: string;
}
