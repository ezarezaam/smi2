/*
  # Create Salaries, Loan, and Accounting Tables

  1. New Tables
    - `salaries` - Gaji karyawan dengan perhitungan lengkap
    - `loans` - Pinjaman karyawan/bisnis dengan tracking pembayaran
    - `loan_payments` - Pembayaran cicilan pinjaman
    - `general_ledger` - Buku besar untuk reporting
    - `trial_balance` - Neraca saldo
    - `financial_reports` - Laporan keuangan yang disimpan

  2. Enhanced Tables
    - Enhanced `employees` untuk relasi dengan salaries dan loans

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2020 AND period_year <= 2050),
  basic_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  allowances DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  overtime_hours DECIMAL(8,2) DEFAULT 0,
  overtime_rate DECIMAL(15,2) DEFAULT 0,
  overtime_pay DECIMAL(15,2) DEFAULT 0,
  gross_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_deduction DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(employee_id, period_month, period_year)
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number VARCHAR(50) NOT NULL UNIQUE,
  borrower_type VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (borrower_type IN ('employee', 'business', 'equipment')),
  borrower_id UUID REFERENCES employees(id),
  borrower_name VARCHAR(255) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_number VARCHAR(50) NOT NULL UNIQUE,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create general_ledger table for reporting
CREATE TABLE IF NOT EXISTS general_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coa_code VARCHAR(10) NOT NULL REFERENCES coa(code),
  transaction_date DATE NOT NULL,
  journal_entry_id UUID REFERENCES journal_entries(id),
  description TEXT NOT NULL,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  running_balance DECIMAL(15,2) DEFAULT 0,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trial_balance table for period-end reporting
CREATE TABLE IF NOT EXISTS trial_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2020 AND period_year <= 2050),
  coa_code VARCHAR(10) NOT NULL REFERENCES coa(code),
  opening_balance DECIMAL(15,2) DEFAULT 0,
  total_debit DECIMAL(15,2) DEFAULT 0,
  total_credit DECIMAL(15,2) DEFAULT 0,
  closing_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_month, period_year, coa_code)
);

-- Create financial_reports table for saved reports
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('profit_loss', 'balance_sheet', 'cash_flow', 'aging_report')),
  report_name VARCHAR(255) NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_salaries_period ON salaries(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_salaries_status ON salaries(status);

CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_number ON loans(loan_number);

CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_payment_date ON loan_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_general_ledger_coa_code ON general_ledger(coa_code);
CREATE INDEX IF NOT EXISTS idx_general_ledger_transaction_date ON general_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_general_ledger_journal_entry_id ON general_ledger(journal_entry_id);

CREATE INDEX IF NOT EXISTS idx_trial_balance_period ON trial_balance(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_trial_balance_coa_code ON trial_balance(coa_code);

CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_financial_reports_period ON financial_reports(period_from, period_to);

-- Enable RLS on all new tables
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access to salaries"
  ON salaries
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to loans"
  ON loans
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to loan_payments"
  ON loan_payments
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to general_ledger"
  ON general_ledger
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to trial_balance"
  ON trial_balance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to financial_reports"
  ON financial_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salaries_updated_at
  BEFORE UPDATE ON salaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_payments_updated_at
  BEFORE UPDATE ON loan_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_ledger_updated_at
  BEFORE UPDATE ON general_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_balance_updated_at
  BEFORE UPDATE ON trial_balance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_reports_updated_at
  BEFORE UPDATE ON financial_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for salaries
INSERT INTO salaries (employee_id, period_month, period_year, basic_salary, allowances, deductions, overtime_hours, overtime_rate, overtime_pay, gross_salary, tax_deduction, net_salary, status, notes)
SELECT 
  e.id,
  1, -- January
  2025,
  CASE 
    WHEN e.role_level = 1 THEN 15000000
    WHEN e.role_level = 2 THEN 10000000
    WHEN e.role_level = 3 THEN 7000000
    ELSE 5000000
  END,
  1000000, -- allowances
  500000,  -- deductions
  10,      -- overtime hours
  50000,   -- overtime rate
  500000,  -- overtime pay
  CASE 
    WHEN e.role_level = 1 THEN 16500000
    WHEN e.role_level = 2 THEN 11500000
    WHEN e.role_level = 3 THEN 8500000
    ELSE 6500000
  END,
  CASE 
    WHEN e.role_level = 1 THEN 1650000
    WHEN e.role_level = 2 THEN 1150000
    WHEN e.role_level = 3 THEN 850000
    ELSE 650000
  END,
  CASE 
    WHEN e.role_level = 1 THEN 14850000
    WHEN e.role_level = 2 THEN 10350000
    WHEN e.role_level = 3 THEN 7650000
    ELSE 5850000
  END,
  'approved',
  'Gaji bulan Januari 2025'
FROM employees e
WHERE e.status = 'active'
ON CONFLICT (employee_id, period_month, period_year) DO NOTHING;

-- Insert sample data for loans
INSERT INTO loans (loan_number, borrower_type, borrower_id, borrower_name, principal_amount, interest_rate, term_months, monthly_payment, remaining_balance, start_date, end_date, status, notes)
SELECT 
  'LOAN-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  'employee',
  e.id,
  e.name,
  10000000, -- 10 juta
  12.0,     -- 12% per tahun
  12,       -- 12 bulan
  888000,   -- monthly payment
  8000000,  -- remaining balance
  '2024-06-01'::date,
  '2025-06-01'::date,
  'active',
  'Pinjaman karyawan untuk keperluan darurat'
FROM employees e
WHERE e.status = 'active'
LIMIT 2
ON CONFLICT (loan_number) DO NOTHING;

-- Insert sample loan payments
INSERT INTO loan_payments (loan_id, payment_number, payment_date, amount, principal_amount, interest_amount, remaining_balance, status, notes)
SELECT 
  l.id,
  'LP-' || l.loan_number || '-' || LPAD(generate_series::text, 2, '0'),
  l.start_date + (generate_series || ' months')::interval,
  l.monthly_payment,
  l.monthly_payment * 0.8, -- 80% principal
  l.monthly_payment * 0.2, -- 20% interest
  l.remaining_balance - (l.monthly_payment * 0.8 * generate_series),
  'completed',
  'Pembayaran cicilan bulan ke-' || generate_series
FROM loans l
CROSS JOIN generate_series(1, 3) -- 3 payments for each loan
WHERE l.status = 'active'
ON CONFLICT (payment_number) DO NOTHING;