import { Contact } from './Contact';
import { Bill } from './Bill';

export interface VendorPayment {
  id?: string;
  payment_number: string;
  vendor_id: string;
  vendor?: Contact;
  bill_id?: string;
  bill?: Bill;
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

export const VENDOR_PAYMENT_STATUS = {
  draft: 'Draft',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const VENDOR_PAYMENT_METHODS = {
  cash: 'Tunai',
  bank_transfer: 'Transfer Bank',
  check: 'Cek',
  credit_card: 'Kartu Kredit',
  other: 'Lainnya'
};