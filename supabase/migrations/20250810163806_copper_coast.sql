/*
  # Complete Sales Order Workflow Implementation

  1. New Tables
    - `delivery_orders` - Surat jalan untuk pengiriman
    - `delivery_order_items` - Detail item yang dikirim
    - `invoices` - Invoice customer (enhanced)
    - `invoice_items` - Detail invoice (enhanced)
    - `customer_payments` - Pembayaran dari customer
    - `backorders` - Backorder untuk stok tidak tersedia
    - `backorder_items` - Detail backorder items

  2. Enhanced Tables
    - `sales_orders` - Added workflow status columns
    - `sales_order_items` - Added delivered/invoiced quantity tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  4. Workflow Status
    - Sales Order: draft, confirmed, delivered, invoiced, paid, cancelled
    - Delivery Status: pending, partial, completed
    - Invoice Status: not_invoiced, partial, fully_invoiced
    - Payment Status: unpaid, partial, paid
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add workflow status columns to sales_orders
DO $$
BEGIN
  -- Add delivery_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_orders' AND column_name = 'delivery_status'
  ) THEN
    ALTER TABLE sales_orders ADD COLUMN delivery_status TEXT DEFAULT 'pending';
  END IF;

  -- Add invoice_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_orders' AND column_name = 'invoice_status'
  ) THEN
    ALTER TABLE sales_orders ADD COLUMN invoice_status TEXT DEFAULT 'not_invoiced';
  END IF;

  -- Add deleted_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_orders' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE sales_orders ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add tracking columns to sales_order_items
DO $$
BEGIN
  -- Add delivered_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_order_items' AND column_name = 'delivered_quantity'
  ) THEN
    ALTER TABLE sales_order_items ADD COLUMN delivered_quantity NUMERIC(15,2) DEFAULT 0;
  END IF;

  -- Add invoiced_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_order_items' AND column_name = 'invoiced_quantity'
  ) THEN
    ALTER TABLE sales_order_items ADD COLUMN invoiced_quantity NUMERIC(15,2) DEFAULT 0;
  END IF;
END $$;

-- Add constraints for sales_orders workflow status
DO $$
BEGIN
  -- Add delivery_status constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_orders_delivery_status_check'
  ) THEN
    ALTER TABLE sales_orders ADD CONSTRAINT sales_orders_delivery_status_check 
    CHECK (delivery_status IN ('pending', 'partial', 'completed'));
  END IF;

  -- Add invoice_status constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_orders_invoice_status_check'
  ) THEN
    ALTER TABLE sales_orders ADD CONSTRAINT sales_orders_invoice_status_check 
    CHECK (invoice_status IN ('not_invoiced', 'partial', 'fully_invoiced'));
  END IF;
END $$;

-- Create delivery_orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_number TEXT NOT NULL UNIQUE,
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id),
  customer_id UUID NOT NULL REFERENCES contacts(id),
  delivery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_address TEXT,
  driver_name TEXT,
  vehicle_number TEXT,
  total_delivered_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  delivered_by TEXT,
  received_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create delivery_order_items table
CREATE TABLE IF NOT EXISTS delivery_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  sales_order_item_id UUID NOT NULL REFERENCES sales_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  ordered_quantity NUMERIC(15,2) NOT NULL,
  delivered_quantity NUMERIC(15,2) NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('good', 'damaged', 'partial_damage')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create invoices table (enhanced)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  sales_order_id UUID REFERENCES sales_orders(id),
  customer_id UUID NOT NULL REFERENCES contacts(id),
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  subtotal_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sales_order_item_id UUID REFERENCES sales_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  description TEXT,
  quantity NUMERIC(15,2) NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create customer_payments table
CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES contacts(id),
  invoice_id UUID REFERENCES invoices(id),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount NUMERIC(15,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
  reference_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create backorders table
CREATE TABLE IF NOT EXISTS backorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backorder_number TEXT NOT NULL UNIQUE,
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id),
  customer_id UUID NOT NULL REFERENCES contacts(id),
  backorder_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_fulfillment_date TIMESTAMPTZ,
  total_backorder_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial_fulfilled', 'fulfilled', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create backorder_items table
CREATE TABLE IF NOT EXISTS backorder_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backorder_id UUID NOT NULL REFERENCES backorders(id) ON DELETE CASCADE,
  sales_order_item_id UUID NOT NULL REFERENCES sales_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  ordered_quantity NUMERIC(15,2) NOT NULL,
  backordered_quantity NUMERIC(15,2) NOT NULL,
  fulfilled_quantity NUMERIC(15,2) DEFAULT 0,
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_orders_sales_order_id ON delivery_orders(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_customer_id ON delivery_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_delivery_date ON delivery_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);

CREATE INDEX IF NOT EXISTS idx_delivery_order_items_delivery_order_id ON delivery_order_items(delivery_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_order_items_product_id ON delivery_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoices_sales_order_id ON invoices(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_invoice_id ON customer_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_date ON customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_status ON customer_payments(status);

CREATE INDEX IF NOT EXISTS idx_backorders_sales_order_id ON backorders(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_backorders_customer_id ON backorders(customer_id);
CREATE INDEX IF NOT EXISTS idx_backorders_status ON backorders(status);

CREATE INDEX IF NOT EXISTS idx_backorder_items_backorder_id ON backorder_items(backorder_id);
CREATE INDEX IF NOT EXISTS idx_backorder_items_product_id ON backorder_items(product_id);

-- Enable RLS on all new tables
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE backorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE backorder_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access to delivery_orders"
  ON delivery_orders FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to delivery_order_items"
  ON delivery_order_items FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to invoices"
  ON invoices FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to invoice_items"
  ON invoice_items FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to customer_payments"
  ON customer_payments FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to backorders"
  ON backorders FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

CREATE POLICY "Allow authenticated users full access to backorder_items"
  ON backorder_items FOR ALL TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_order_items_updated_at
  BEFORE UPDATE ON delivery_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_payments_updated_at
  BEFORE UPDATE ON customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backorders_updated_at
  BEFORE UPDATE ON backorders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backorder_items_updated_at
  BEFORE UPDATE ON backorder_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();