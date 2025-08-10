export interface CreditNote {
  id?: string;
  credit_note_number: string;
  customer_id: string;
  customer?: any;
  invoice_id?: string;
  invoice?: any;
  credit_date: string | Date;
  total_amount: number;
  reason: string;
  status: 'draft' | 'issued' | 'applied';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: CreditNoteItem[];
}

export interface CreditNoteItem {
  id?: string;
  credit_note_id?: string;
  product_id?: string;
  product?: any;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const CREDIT_NOTE_STATUS = {
  draft: 'Draft',
  issued: 'Diterbitkan',
  applied: 'Diterapkan'
};