export interface Loan {
  id?: string;
  loan_number: string;
  borrower_type: 'employee' | 'business' | 'equipment';
  borrower_id?: string;
  borrower_name: string;
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
  deleted_at?: string;
  payments?: LoanPayment[];
  borrower?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface LoanPayment {
  id?: string;
  loan_id: string;
  payment_number: string;
  payment_date: string | Date;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  remaining_balance: number;
  status: 'completed' | 'pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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

export const DEFAULT_LOAN: Omit<Loan, 'id'> = {
  loan_number: '',
  borrower_type: 'employee',
  borrower_name: '',
  principal_amount: 0,
  interest_rate: 12,
  term_months: 12,
  monthly_payment: 0,
  remaining_balance: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  status: 'active',
  notes: ''
};