import { Contact } from './Contact';
import { Product } from './Product';
import { UOM } from './UOM';

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  product_id?: string;
  product?: Product;
  quantity: number;
  uom_id?: number;
  uom?: UOM;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  discount?: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id?: string;
  order_number: string;
  contacts_id?: string;
  contact?: Contact;
  total_amount: number;
  status?: 'draft' | 'ordered' | 'received' | 'cancelled';
  order_date: string | Date;
  expected_delivery_date?: string | Date;
  received_date?: string | Date;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: PurchaseOrderItem[];
}

export const PURCHASE_ORDER_STATUS = {
  draft: 'Draft',
  ordered: 'Dipesan',
  received: 'Diterima',
  cancelled: 'Dibatalkan'
};

export const PAYMENT_STATUS = {
  unpaid: 'Belum Dibayar',
  partial: 'Sebagian',
  paid: 'Lunas'
};

export const PAYMENT_METHODS = {
  cash: 'Tunai',
  transfer: 'Transfer Bank',
  credit_card: 'Kartu Kredit',
  debit_card: 'Kartu Debit',
  check: 'Cek',
  other: 'Lainnya'
};
