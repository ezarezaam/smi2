-- Create sales_orders table
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for sales_orders
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON public.sales_orders USING btree (customer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON public.sales_orders USING btree (payment_status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON public.sales_orders USING btree (order_date) TABLESPACE pg_default;

-- Create sales_order_items table
CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
    uom_id INTEGER REFERENCES public.m_uom(id),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for sales_order_items
CREATE INDEX IF NOT EXISTS idx_sales_order_items_sales_order_id ON public.sales_order_items USING btree (sales_order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON public.sales_order_items USING btree (product_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_sales_order_items_uom_id ON public.sales_order_items USING btree (uom_id) TABLESPACE pg_default;

-- Create trigger for updated_at on sales_orders
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_sales_orders
BEFORE UPDATE ON public.sales_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create trigger for updated_at on sales_order_items
CREATE TRIGGER set_timestamp_sales_order_items
BEFORE UPDATE ON public.sales_order_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
