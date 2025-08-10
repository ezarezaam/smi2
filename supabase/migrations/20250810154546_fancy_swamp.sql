/*
  # Purchase Order Complete Workflow Tables

  1. New Tables
    - `bills` - Tagihan dari vendor berdasarkan PO
    - `bill_items` - Item detail tagihan
    - `vendor_payments` - Pembayaran ke vendor
    - `journal_entries` - Jurnal akuntansi
    - `journal_items` - Detail jurnal akuntansi
    - `purchase_receipts` - Penerimaan barang (partial/full)
    - `purchase_receipt_items` - Detail penerimaan barang

  2. Table Updates
    - Update existing tables to support soft delete
    - Add missing columns for workflow

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update purchase_orders table to support soft delete and additional fields
ALTER TABLE public.purchase_orders 
ADD COLUMN IF NOT EXISTS received_status TEXT DEFAULT 'pending' CHECK (received_status IN ('pending', 'partial', 'completed')),
ADD COLUMN IF NOT EXISTS billed_status TEXT DEFAULT 'not_billed' CHECK (billed_status IN ('not_billed', 'partial', 'fully_billed')),
ADD COLUMN IF NOT EXISTS paid_status TEXT DEFAULT 'unpaid' CHECK (paid_status IN ('unpaid', 'partial', 'paid'));

-- Update purchase_order_items table
ALTER TABLE public.purchase_order_items 
ADD COLUMN IF NOT EXISTS received_quantity DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS billed_quantity DECIMAL(15, 2) DEFAULT 0;

-- Create purchase_receipts table (penerimaan barang)
CREATE TABLE IF NOT EXISTS public.purchase_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id),
    vendor_id UUID NOT NULL REFERENCES public.contacts(id),
    receipt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    total_received_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create purchase_receipt_items table
CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES public.purchase_receipts(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    ordered_quantity DECIMAL(15, 2) NOT NULL,
    received_quantity DECIMAL(15, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('good', 'damaged', 'partial_damage')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create bills table (tagihan dari vendor)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number TEXT NOT NULL UNIQUE,
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    vendor_id UUID NOT NULL REFERENCES public.contacts(id),
    bill_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    subtotal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'paid', 'overdue', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS public.bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    purchase_order_item_id UUID REFERENCES public.purchase_order_items(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(15, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create vendor_payments table (pembayaran ke vendor)
CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES public.contacts(id),
    bill_id UUID REFERENCES public.bills(id),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
    reference_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create journal_entries table (jurnal akuntansi)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number TEXT NOT NULL UNIQUE,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('purchase_order', 'bill', 'payment', 'receipt', 'manual')),
    reference_id UUID,
    total_debit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    posted_date TIMESTAMP WITH TIME ZONE,
    posted_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create journal_items table (detail jurnal)
CREATE TABLE IF NOT EXISTS public.journal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    coa_code TEXT NOT NULL REFERENCES public.coa(code),
    description TEXT NOT NULL,
    debit_amount DECIMAL(15, 2) DEFAULT 0,
    credit_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po_id ON public.purchase_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_vendor_id ON public.purchase_receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_receipt_id ON public.purchase_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_product_id ON public.purchase_receipt_items(product_id);

CREATE INDEX IF NOT EXISTS idx_bills_po_id ON public.bills(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_id ON public.bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON public.bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON public.bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON public.bill_items(product_id);

CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON public.vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_bill_id ON public.vendor_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_status ON public.vendor_payments(status);

CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON public.journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_items_journal_id ON public.journal_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_coa_code ON public.journal_items(coa_code);

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_purchase_receipts_updated_at
BEFORE UPDATE ON public.purchase_receipts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_receipt_items_updated_at
BEFORE UPDATE ON public.purchase_receipt_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_items_updated_at
BEFORE UPDATE ON public.bill_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_payments_updated_at
BEFORE UPDATE ON public.vendor_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_items_updated_at
BEFORE UPDATE ON public.journal_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access to purchase_receipts"
ON public.purchase_receipts FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to purchase_receipt_items"
ON public.purchase_receipt_items FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to bills"
ON public.bills FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to bill_items"
ON public.bill_items FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to vendor_payments"
ON public.vendor_payments FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to journal_entries"
ON public.journal_entries FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to journal_items"
ON public.journal_items FOR ALL
TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (deleted_at IS NULL);

-- Create functions for automatic journal entry creation

-- Function to create journal entry for purchase receipt
CREATE OR REPLACE FUNCTION create_purchase_receipt_journal(
    receipt_id UUID,
    receipt_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(15, 2),
    vendor_name TEXT
) RETURNS UUID AS $$
DECLARE
    entry_id UUID;
    entry_number TEXT;
BEGIN
    -- Generate entry number
    entry_number := 'JE-RCP-' || TO_CHAR(receipt_date, 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    
    -- Create journal entry
    INSERT INTO public.journal_entries (
        entry_number,
        entry_date,
        description,
        reference_type,
        reference_id,
        total_debit,
        total_credit,
        status
    ) VALUES (
        entry_number,
        receipt_date,
        'Penerimaan barang dari ' || vendor_name,
        'receipt',
        receipt_id,
        total_amount,
        total_amount,
        'posted'
    ) RETURNING id INTO entry_id;
    
    -- Create journal items
    -- Debit: Inventory (1300)
    INSERT INTO public.journal_items (
        journal_entry_id,
        coa_code,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        entry_id,
        '1300',
        'Penambahan inventory dari penerimaan barang',
        total_amount,
        0
    );
    
    -- Credit: Hutang Dagang (2100)
    INSERT INTO public.journal_items (
        journal_entry_id,
        coa_code,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        entry_id,
        '2100',
        'Hutang kepada vendor ' || vendor_name,
        0,
        total_amount
    );
    
    RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create journal entry for bill
CREATE OR REPLACE FUNCTION create_bill_journal(
    bill_id UUID,
    bill_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(15, 2),
    vendor_name TEXT
) RETURNS UUID AS $$
DECLARE
    entry_id UUID;
    entry_number TEXT;
BEGIN
    -- Generate entry number
    entry_number := 'JE-BILL-' || TO_CHAR(bill_date, 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    
    -- Create journal entry
    INSERT INTO public.journal_entries (
        entry_number,
        entry_date,
        description,
        reference_type,
        reference_id,
        total_debit,
        total_credit,
        status
    ) VALUES (
        entry_number,
        bill_date,
        'Tagihan dari vendor ' || vendor_name,
        'bill',
        bill_id,
        total_amount,
        total_amount,
        'posted'
    ) RETURNING id INTO entry_id;
    
    -- Journal items will be created based on bill items
    -- This is just a placeholder - actual implementation should be more detailed
    
    RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create journal entry for vendor payment
CREATE OR REPLACE FUNCTION create_vendor_payment_journal(
    payment_id UUID,
    payment_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(15, 2),
    vendor_name TEXT,
    payment_method TEXT
) RETURNS UUID AS $$
DECLARE
    entry_id UUID;
    entry_number TEXT;
    cash_coa TEXT;
BEGIN
    -- Generate entry number
    entry_number := 'JE-PAY-' || TO_CHAR(payment_date, 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    
    -- Determine cash/bank account based on payment method
    cash_coa := CASE 
        WHEN payment_method = 'cash' THEN '1100'
        WHEN payment_method = 'bank_transfer' THEN '1200'
        WHEN payment_method = 'check' THEN '1200'
        ELSE '1100'
    END;
    
    -- Create journal entry
    INSERT INTO public.journal_entries (
        entry_number,
        entry_date,
        description,
        reference_type,
        reference_id,
        total_debit,
        total_credit,
        status
    ) VALUES (
        entry_number,
        payment_date,
        'Pembayaran ke vendor ' || vendor_name || ' via ' || payment_method,
        'payment',
        payment_id,
        amount,
        amount,
        'posted'
    ) RETURNING id INTO entry_id;
    
    -- Create journal items
    -- Debit: Hutang Dagang (2100)
    INSERT INTO public.journal_items (
        journal_entry_id,
        coa_code,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        entry_id,
        '2100',
        'Pembayaran hutang kepada vendor ' || vendor_name,
        amount,
        0
    );
    
    -- Credit: Kas/Bank
    INSERT INTO public.journal_items (
        journal_entry_id,
        coa_code,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        entry_id,
        cash_coa,
        'Pengeluaran kas untuk pembayaran vendor',
        0,
        amount
    );
    
    RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

-- Add some sample COA data if not exists
INSERT INTO public.coa (code, name, category, subcategory, is_active) VALUES
('1100', 'Kas', 'Aset', 'Aset Lancar', true),
('1200', 'Bank', 'Aset', 'Aset Lancar', true),
('1300', 'Persediaan', 'Aset', 'Aset Lancar', true),
('2100', 'Hutang Dagang', 'Kewajiban', 'Kewajiban Lancar', true),
('5100', 'Beban Pembelian', 'Beban', 'Beban Operasional', true),
('5200', 'Beban Administrasi', 'Beban', 'Beban Operasional', true)
ON CONFLICT (code) DO NOTHING;