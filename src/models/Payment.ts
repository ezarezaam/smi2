export interface Payment {
  id?: string;
  payment_number: string;
  reference_type: 'invoice' | 'bill' | 'sales_order' | 'purchase_order';
  reference_id: string;
  reference_number: string;
  amount: number;
  payment_date: string | Date;
  payment_method: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export const PAYMENT_METHODS = {
  cash: 'Tunai',
  bank_transfer: 'Transfer Bank',
  credit_card: 'Kartu Kredit',
  debit_card: 'Kartu Debit',
  check: 'Cek',
  other: 'Lainnya'
};

export const PAYMENT_STATUS = {
  completed: 'Selesai',
  pending: 'Pending',
  cancelled: 'Dibatalkan'
};