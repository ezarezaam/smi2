export interface Bill {
  id?: string;
  bill_number: string;
  vendor_id: string;
  vendor?: any;
  bill_date: string | Date;
  due_date?: string | Date;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: BillItem[];
}

export interface BillItem {
  id?: string;
  bill_id?: string;
  product_id?: string;
  product?: any;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  total_price: number;
}

export const BILL_STATUS = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue'
};

export const PAYMENT_STATUS = {
  unpaid: 'Belum Dibayar',
  partial: 'Sebagian',
  paid: 'Lunas'
};