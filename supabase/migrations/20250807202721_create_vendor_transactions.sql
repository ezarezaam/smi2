-- Create vendor_transactions table
CREATE TABLE IF NOT EXISTS vendor_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  transaction_id VARCHAR NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_status ON vendor_transactions(status);

-- Sample data for vendor transactions
INSERT INTO vendor_transactions (vendor_id, transaction_id, transaction_date, amount, description, status)
SELECT 
  id as vendor_id,
  'TX-' || (ROW_NUMBER() OVER ()) || '001' as transaction_id,
  NOW() - (RANDOM() * INTERVAL '90 days') as transaction_date,
  (RANDOM() * 10000)::DECIMAL(15,2) as amount,
  CASE 
    WHEN RANDOM() < 0.33 THEN 'Purchase Order'
    WHEN RANDOM() < 0.66 THEN 'Service Payment'
    ELSE 'Maintenance Contract'
  END as description,
  CASE 
    WHEN RANDOM() < 0.6 THEN 'paid'
    WHEN RANDOM() < 0.9 THEN 'pending'
    ELSE 'cancelled'
  END as status
FROM vendors
CROSS JOIN generate_series(1, 5);

-- Add RLS policies
ALTER TABLE vendor_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON vendor_transactions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON vendor_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON vendor_transactions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON vendor_transactions
  FOR DELETE USING (auth.role() = 'authenticated');
