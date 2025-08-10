-- Migrasi untuk mengubah customer_id menjadi contacts_id di tabel sales_orders

-- 1. Tambahkan kolom contacts_id baru
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS contacts_id UUID REFERENCES contacts(id);

-- 2. Salin data dari customer_id ke contacts_id (jika ada data yang perlu dimigrasi)
-- UPDATE sales_orders SET contacts_id = customer_id WHERE customer_id IS NOT NULL;

-- 3. Hapus foreign key constraint customer_id
ALTER TABLE sales_orders DROP CONSTRAINT IF EXISTS sales_orders_customer_id_fkey;

-- 4. Hapus kolom customer_id
ALTER TABLE sales_orders DROP COLUMN IF EXISTS customer_id;
