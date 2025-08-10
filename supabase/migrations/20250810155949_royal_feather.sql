/*
  # Complete Purchase Order Workflow Implementation

  1. New Tables
    - `purchase_receipts` - Penerimaan barang dari PO
    - `purchase_receipt_items` - Detail item yang diterima
    - `vendor_payments` - Pembayaran ke vendor (enhanced)
    - `journal_entries` - Jurnal akuntansi (enhanced)
    - `journal_items` - Detail jurnal (enhanced)

  2. Enhanced Tables
    - `purchase_orders` - Added workflow status columns
    - `purchase_order_items` - Added received/billed quantity tracking
    - `bills` - Enhanced with PO integration
    - `bill_items` - Enhanced with PO item tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update purchase_orders table with workflow status columns
DO $$
BEGIN
  -- Add received_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_orders' AND column_name = 'received_status'
  ) THEN
    ALTER TABLE purchase_orders ADD COLUMN received_status TEXT DEFAULT 'pending' CHECK (received_status IN ('pending', 'partial', 'completed'));
  END IF;

  -- Add billed_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_orders' AND column_name = 'billed_status'
  ) THEN
    ALTER TABLE purchase_orders ADD COLUMN billed_status TEXT DEFAULT 'not_billed' CHECK (billed_status IN ('not_billed', 'partial', 'fully_billed'));
  END IF;

  -- Add paid_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_orders' AND column_name = 'paid_status'
  ) THEN
    ALTER TABLE purchase_orders ADD COLUMN paid_status TEXT DEFAULT 'unpaid' CHECK (paid_status IN ('unpaid', 'partial', 'paid'));
  END IF;
END $$;

-- Update purchase_order_items table with tracking columns
DO $$
BEGIN
  -- Add received_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_order_items' AND column_name = 'received_quantity'
  ) THEN
    ALTER TABLE purchase_order_items ADD COLUMN received_quantity NUMERIC(15,2) DEFAULT 0;
  END IF;

  -- Add billed_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_order_items' AND column_name = 'billed_quantity'
  ) THEN
    ALTER TABLE purchase_order_items ADD COLUMN billed_quantity NUMERIC(15,2) DEFAULT 0;
  END IF;
END $$;

-- Create purchase_receipts table
CREATE TABLE IF NOT EXISTS purchase_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  vendor_id UUID NOT NULL REFERENCES contacts(id),
  receipt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_received_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  notes TEXT,
  received_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create purchase_receipt_items table
CREATE TABLE IF NOT EXISTS purchase_receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES purchase_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  ordered_quantity NUMERIC(15,2) NOT NULL,
  received_quantity NUMERIC(15,2) NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('good', 'damaged', 'partial_damage')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enhance bills table
DO $$
BEGIN
  -- Add purchase_order_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bills' AND column_name = 'purchase_order_id'
  ) THEN
    ALTER TABLE bills ADD COLUMN purchase_order_id UUID REFERENCES purchase_orders(id);
  END IF;

  -- Add subtotal_amount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bills' AND column_name = 'subtotal_amount'
  ) THEN
    ALTER TABLE bills ADD COLUMN subtotal_amount NUMERIC(15,2) DEFAULT 0;
  END IF;

  -- Add discount_amount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bills' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE bills ADD COLUMN discount_amount NUMERIC(15,2) DEFAULT 0;
  END IF;

  -- Add payment_terms if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bills' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE bills ADD COLUMN payment_terms TEXT;
  END IF;
END $$;

-- Enhance bill_items table
DO $$
BEGIN
  -- Add purchase_order_item_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_items' AND column_name = 'purchase_order_item_id'
  ) THEN
    ALTER TABLE bill_items ADD COLUMN purchase_order_item_id UUID REFERENCES purchase_order_items(id);
  END IF;

  -- Add discount_amount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bill_items' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE bill_items ADD COLUMN discount_amount NUMERIC(15,2) DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po_id ON purchase_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_vendor_id ON purchase_receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_receipt_id ON purchase_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_product_id ON purchase_receipt_items(product_id);
CREATE INDEX IF NOT EXISTS idx_bills_po_id ON bills(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_id ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_bill_id ON vendor_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_status ON vendor_payments(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_items_journal_id ON journal_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_coa_code ON journal_items(coa_code);

-- Enable RLS on all tables
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users full access to purchase_receipts"
  ON purchase_receipts
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to purchase_receipt_items"
  ON purchase_receipt_items
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to vendor_payments"
  ON vendor_payments
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to journal_entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to journal_items"
  ON journal_items
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_purchase_receipts_updated_at
  BEFORE UPDATE ON purchase_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_receipt_items_updated_at
  BEFORE UPDATE ON purchase_receipt_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_payments_updated_at
  BEFORE UPDATE ON vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_items_updated_at
  BEFORE UPDATE ON journal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();