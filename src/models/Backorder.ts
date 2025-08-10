import { Contact } from './Contact';
import { Product } from './Product';
import { SalesOrder } from './SalesOrder';

export interface BackorderItem {
  id?: string;
  backorder_id?: string;
  sales_order_item_id: string;
  product_id: string;
  product?: Product;
  ordered_quantity: number;
  backordered_quantity: number;
  fulfilled_quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Backorder {
  id?: string;
  backorder_number: string;
  sales_order_id: string;
  sales_order?: SalesOrder;
  customer_id: string;
  customer?: Contact;
  backorder_date: string | Date;
  expected_fulfillment_date?: string | Date;
  total_backorder_amount: number;
  status: 'pending' | 'partial_fulfilled' | 'fulfilled' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: BackorderItem[];
}

export const BACKORDER_STATUS = {
  pending: 'Pending',
  partial_fulfilled: 'Sebagian Terpenuhi',
  fulfilled: 'Terpenuhi',
  cancelled: 'Dibatalkan'
};