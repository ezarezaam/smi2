import { Contact } from './Contact';
import { Product } from './Product';
import { PurchaseOrder } from './PurchaseOrder';

export interface PurchaseReceiptItem {
  id?: string;
  receipt_id?: string;
  purchase_order_item_id: string;
  product_id: string;
  product?: Product;
  ordered_quantity: number;
  received_quantity: number;
  unit_price: number;
  total_amount: number;
  condition_status: 'good' | 'damaged' | 'partial_damage';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface PurchaseReceipt {
  id?: string;
  receipt_number: string;
  purchase_order_id: string;
  purchase_order?: PurchaseOrder;
  vendor_id: string;
  vendor?: Contact;
  receipt_date: string | Date;
  total_received_amount: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  received_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: PurchaseReceiptItem[];
}

export const RECEIPT_STATUS = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan'
};

export const CONDITION_STATUS = {
  good: 'Baik',
  damaged: 'Rusak',
  partial_damage: 'Sebagian Rusak'
};