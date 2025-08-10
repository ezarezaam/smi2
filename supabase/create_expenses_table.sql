-- Pastikan kolom relasi kategori pengeluaran lain
ALTER TABLE m_other_expenses
ADD COLUMN IF NOT EXISTS expenses_category_id INTEGER REFERENCES m_expenses_category(id);

-- Membuat tabel expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  category_id INT REFERENCES m_expenses_category(id),
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  expense_code VARCHAR(20),
  coa_code VARCHAR(8) REFERENCES coa(code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membuat trigger untuk mengupdate kolom updated_at
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_expenses_updated_at();

-- Membuat indeks untuk mempercepat pencarian
CREATE INDEX IF NOT EXISTS idx_expenses_transaction_id ON expenses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_transaction_date ON expenses(transaction_date);
