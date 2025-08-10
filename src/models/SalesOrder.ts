import { Contact } from './Contact';
import { Product } from './Product';
import { Service } from './Service';
import { UOM } from './UOM';

// Type to represent either a product or a service (which is now a product with group='Service')

export interface SalesOrderItem {
  id?: string;
  sales_order_id?: string;
  product_id?: string;
  product?: Product;
  // service_id and service fields are kept for backward compatibility
  // but now service is just a Product with group='Service'
  service_id?: string;
  service?: Service;
  // Flag to indicate if this item is a service
  is_service?: boolean;
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

export interface SalesOrder {
  id?: string;
  order_number: string;
  contacts_id?: string;
  contact?: Contact;
  total_amount: number;
  status?: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  order_date: string | Date;
  expected_delivery_date?: string | Date;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: SalesOrderItem[];
}

export const ORDER_STATUS = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  delivered: 'Terkirim',
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
