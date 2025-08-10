import { Contact } from './Contact';
import { Invoice } from './Invoice';

export interface CustomerPayment {
  id?: string;
  payment_number: string;
  customer_id: string;
  customer?: Contact;
  invoice_id?: string;
  invoice?: Invoice;
  payment_date: string | Date;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';
  reference_number?: string;
  notes?: string;
  status: 'draft' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const CUSTOMER_PAYMENT_STATUS = {
  draft: 'Draft',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const CUSTOMER_PAYMENT_METHODS = {
  cash: 'Tunai',
  bank_transfer: 'Transfer Bank',
  check: 'Cek',
  credit_card: 'Kartu Kredit',
  other: 'Lainnya'
};