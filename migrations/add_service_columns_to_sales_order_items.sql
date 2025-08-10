-- Add service_id and is_service columns to sales_order_items table
ALTER TABLE public.sales_order_items 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id),
ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT FALSE;

-- Create index for service_id
CREATE INDEX IF NOT EXISTS idx_sales_order_items_service_id ON public.sales_order_items USING btree (service_id) TABLESPACE pg_default;
