export interface GeneralLedgerEntry {
  id?: string;
  coa_code: string;
  coa?: {
    code: string;
    name: string;
    category: string;
    subcategory?: string;
  };
  transaction_date: string | Date;
  journal_entry_id?: string;
  journal_entry?: {
    id: string;
    entry_number: string;
    description: string;
  };
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  reference_type?: string;
  reference_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrialBalance {
  id?: string;
  period_month: number;
  period_year: number;
  coa_code: string;
  coa?: {
    code: string;
    name: string;
    category: string;
    subcategory?: string;
  };
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialReport {
  id?: string;
  report_type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'aging_report';
  report_name: string;
  period_from: string | Date;
  period_to: string | Date;
  report_data: any;
  generated_by?: string;
  generator?: {
    id: string;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const REPORT_TYPES = {
  profit_loss: 'Laporan Laba Rugi',
  balance_sheet: 'Neraca',
  cash_flow: 'Laporan Arus Kas',
  aging_report: 'Aging Report'
};