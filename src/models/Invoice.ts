export interface Invoice {
  id?: string;
  invoice_number: string;
  customer_id: string;
  customer?: any;
  invoice_date: string | Date;
  due_date?: string | Date;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  product?: any;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  total_price: number;
}

export const INVOICE_STATUS = {
  draft: 'Draft',
  sent: 'Terkirim',
  paid: 'Dibayar',
  overdue: 'Jatuh Tempo'
};