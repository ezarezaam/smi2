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

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Enhance purchase_orders table with workflow status columns
DO $$
BEGIN
    -- Add workflow status columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'received_status') THEN
        ALTER TABLE purchase_orders ADD COLUMN received_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'billed_status') THEN
        ALTER TABLE purchase_orders ADD COLUMN billed_status TEXT DEFAULT 'not_billed';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'paid_status') THEN
        ALTER TABLE purchase_orders ADD COLUMN paid_status TEXT DEFAULT 'unpaid';
    END IF;
    
    -- Add constraints for status values
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'purchase_orders_received_status_check') THEN
        ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_received_status_check 
        CHECK (received_status IN ('pending', 'partial', 'completed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'purchase_orders_billed_status_check') THEN
        ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_billed_status_check 
        CHECK (billed_status IN ('not_billed', 'partial', 'fully_billed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'purchase_orders_paid_status_check') THEN
        ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_paid_status_check 
        CHECK (paid_status IN ('unpaid', 'partial', 'paid'));
    END IF;
END $$;

-- 2. Enhance purchase_order_items table with quantity tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'received_quantity') THEN
        ALTER TABLE purchase_order_items ADD COLUMN received_quantity NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'billed_quantity') THEN
        ALTER TABLE purchase_order_items ADD COLUMN billed_quantity NUMERIC(15,2) DEFAULT 0;
    END IF;
END $$;

-- 3. Create purchase_receipts table
CREATE TABLE IF NOT EXISTS purchase_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    vendor_id UUID NOT NULL REFERENCES contacts(id),
    receipt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    total_received_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add constraints for purchase_receipts
ALTER TABLE purchase_receipts ADD CONSTRAINT purchase_receipts_status_check 
CHECK (status IN ('draft', 'confirmed', 'cancelled'));

-- 4. Create purchase_receipt_items table
CREATE TABLE IF NOT EXISTS purchase_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES purchase_receipts(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
    product_id UUID NOT NULL REFERENCES products(id),
    ordered_quantity NUMERIC(15,2) NOT NULL,
    received_quantity NUMERIC(15,2) NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    condition_status TEXT DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add constraints for purchase_receipt_items
ALTER TABLE purchase_receipt_items ADD CONSTRAINT purchase_receipt_items_condition_status_check 
CHECK (condition_status IN ('good', 'damaged', 'partial_damage'));

-- 5. Enhance bills table
DO $$
BEGIN
    -- Add purchase_order_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'purchase_order_id') THEN
        ALTER TABLE bills ADD COLUMN purchase_order_id UUID REFERENCES purchase_orders(id);
    END IF;
    
    -- Add subtotal_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'subtotal_amount') THEN
        ALTER TABLE bills ADD COLUMN subtotal_amount NUMERIC(15,2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Add tax_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'tax_amount') THEN
        ALTER TABLE bills ADD COLUMN tax_amount NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    -- Add discount_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'discount_amount') THEN
        ALTER TABLE bills ADD COLUMN discount_amount NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    -- Add paid_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'paid_amount') THEN
        ALTER TABLE bills ADD COLUMN paid_amount NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    -- Add payment_terms if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'payment_terms') THEN
        ALTER TABLE bills ADD COLUMN payment_terms TEXT;
    END IF;
END $$;

-- 6. Enhance bill_items table
DO $$
BEGIN
    -- Add purchase_order_item_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'purchase_order_item_id') THEN
        ALTER TABLE bill_items ADD COLUMN purchase_order_item_id UUID REFERENCES purchase_order_items(id);
    END IF;
    
    -- Add description if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'description') THEN
        ALTER TABLE bill_items ADD COLUMN description TEXT;
    END IF;
    
    -- Add tax_percent if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'tax_percent') THEN
        ALTER TABLE bill_items ADD COLUMN tax_percent NUMERIC(5,2) DEFAULT 0;
    END IF;
    
    -- Add tax_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'tax_amount') THEN
        ALTER TABLE bill_items ADD COLUMN tax_amount NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    -- Add discount_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'discount_amount') THEN
        ALTER TABLE bill_items ADD COLUMN discount_amount NUMERIC(15,2) DEFAULT 0;
    END IF;
    
    -- Add total_amount if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = 'total_amount') THEN
        ALTER TABLE bill_items ADD COLUMN total_amount NUMERIC(15,2) NOT NULL;
    END IF;
END $$;

-- 7. Create vendor_payments table
CREATE TABLE IF NOT EXISTS vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES contacts(id),
    bill_id UUID REFERENCES bills(id),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount NUMERIC(15,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    reference_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add constraints for vendor_payments
ALTER TABLE vendor_payments ADD CONSTRAINT vendor_payments_payment_method_check 
CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other'));

ALTER TABLE vendor_payments ADD CONSTRAINT vendor_payments_status_check 
CHECK (status IN ('draft', 'completed', 'cancelled'));

-- 8. Create journal_entries table (enhanced)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number TEXT NOT NULL UNIQUE,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    total_debit NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(15,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    posted_date TIMESTAMP WITH TIME ZONE,
    posted_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add constraints for journal_entries
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_reference_type_check 
CHECK (reference_type IN ('purchase_order', 'bill', 'payment', 'receipt', 'manual'));

ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_status_check 
CHECK (status IN ('draft', 'posted', 'reversed'));

-- 9. Create journal_items table
CREATE TABLE IF NOT EXISTS journal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    coa_code TEXT NOT NULL REFERENCES coa(code),
    description TEXT NOT NULL,
    debit_amount NUMERIC(15,2) DEFAULT 0,
    credit_amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po_id ON purchase_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_vendor_id ON purchase_receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_receipt_id ON purchase_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_product_id ON purchase_receipt_items(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_bill_id ON vendor_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_status ON vendor_payments(status);
CREATE INDEX IF NOT EXISTS idx_bills_po_id ON bills(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_id ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_items_journal_id ON journal_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_coa_code ON journal_items(coa_code);

-- Create triggers for updated_at
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

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_items_updated_at
    BEFORE UPDATE ON bill_items
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

-- Enable RLS on all tables
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
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

CREATE POLICY "Allow authenticated users full access to bills"
    ON bills
    FOR ALL
    TO authenticated
    USING (deleted_at IS NULL)
    WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to bill_items"
    ON bill_items
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