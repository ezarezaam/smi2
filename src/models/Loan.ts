export interface Loan {
  id?: string;
  loan_number: string;
  borrower_name: string;
  loan_type: 'employee' | 'business' | 'equipment';
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  remaining_balance: number;
  start_date: string | Date;
  end_date: string | Date;
  status: 'active' | 'paid_off' | 'defaulted';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  payments?: LoanPayment[];
}

export interface LoanPayment {
  id?: string;
  loan_id: string;
  payment_date: string | Date;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  remaining_balance: number;
  status: 'completed' | 'pending';
}

export const LOAN_STATUS = {
  active: 'Aktif',
  paid_off: 'Lunas',
  defaulted: 'Gagal Bayar'
};

export const LOAN_TYPES = {
  employee: 'Pinjaman Karyawan',
  business: 'Pinjaman Bisnis',
  equipment: 'Pinjaman Peralatan'
};