-- Add UOM and tax columns to purchase_order_items table
ALTER TABLE public.purchase_order_items 
ADD COLUMN uom_id integer NULL,
ADD COLUMN tax_percent numeric(5, 2) NULL DEFAULT 0,
ADD COLUMN tax_amount numeric(15, 2) NULL DEFAULT 0;

-- Add foreign key constraint for UOM
ALTER TABLE public.purchase_order_items
ADD CONSTRAINT purchase_order_items_uom_id_fkey FOREIGN KEY (uom_id) REFERENCES public.m_uom (id);

-- Create index for UOM
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_uom_id ON public.purchase_order_items USING btree (uom_id) TABLESPACE pg_default;

-- Fix the deleted_at column default value (it should be NULL, not NOW())
ALTER TABLE public.purchase_order_items 
ALTER COLUMN deleted_at DROP DEFAULT;
