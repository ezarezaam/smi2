import { Contact } from './Contact';
import { SalesOrder } from './SalesOrder';
import { Product } from './Product';

export interface Invoice {
  id?: string;
  invoice_number: string;
  sales_order_id?: string;
  sales_order?: SalesOrder;
  customer_id: string;
  customer?: Contact;
  invoice_date: string | Date;
  due_date?: string | Date;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_terms?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  sales_order_item_id?: string;
  product_id?: string;
  product?: Product;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  discount_amount: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const INVOICE_STATUS = {
  draft: 'Draft',
  sent: 'Terkirim',
  paid: 'Dibayar',
  overdue: 'Jatuh Tempo',
  cancelled: 'Dibatalkan'
};