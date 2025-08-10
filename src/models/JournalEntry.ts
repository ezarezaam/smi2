export interface JournalEntry {
  id?: string;
  entry_number: string;
  entry_date: string | Date;
  description: string;
  reference_type?: 'purchase_order' | 'bill' | 'payment' | 'receipt' | 'manual';
  reference_id?: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  posted_date?: string | Date;
  posted_by?: string;
  created_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: JournalItem[];
}

export interface JournalItem {
  id?: string;
  journal_entry_id?: string;
  coa_code: string;
  coa?: any;
  description: string;
  debit_amount: number;
  credit_amount: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const JOURNAL_STATUS = {
  draft: 'Draft',
  posted: 'Posted',
  reversed: 'Reversed'
};