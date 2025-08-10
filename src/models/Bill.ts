export interface Bill {
  id?: string;
  bill_number: string;
  purchase_order_id?: string;
  purchase_order?: any;
  vendor_id: string;
  vendor?: any;
  bill_date: string | Date;
  due_date?: string | Date;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_terms?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: BillItem[];
}

export interface BillItem {
  id?: string;
  bill_id?: string;
  purchase_order_item_id?: string;
  product_id?: string;
  product?: any;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const BILL_STATUS = {
  draft: 'Draft',
  sent: 'Terkirim',
  approved: 'Disetujui',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Dibatalkan'
};

export const PAYMENT_STATUS = {
  unpaid: 'Belum Dibayar',
  partial: 'Sebagian',
  paid: 'Lunas'
};