-- Membuat tabel contacts yang menggabungkan vendors dan customers
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  contact_person text NULL,
  email text NULL,
  phone text NULL,
  address text NULL,
  category text NULL,
  type text NOT NULL, -- 'vendor', 'customer', atau 'both'
  status text NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_name_unique UNIQUE (name)
) TABLESPACE pg_default;

-- Migrasi data dari vendors ke contacts
INSERT INTO public.contacts (id, name, contact_person, email, phone, address, category, type, status, created_at, updated_at)
SELECT id, name, contact_person, email, phone, address, category, 'vendor', status, created_at, updated_at
FROM public.vendors;

-- Migrasi data dari customers ke contacts
-- Untuk customer yang namanya sudah ada di contacts (dari vendors), update type menjadi 'both'
-- Untuk customer yang namanya belum ada, insert sebagai customer baru
DO $$
DECLARE
    c RECORD;
BEGIN
    FOR c IN SELECT * FROM public.customers LOOP
        IF EXISTS (SELECT 1 FROM public.contacts WHERE name = c.name) THEN
            -- Update type menjadi 'both' jika nama sudah ada
            UPDATE public.contacts SET type = 'both' WHERE name = c.name;
        ELSE
            -- Insert sebagai customer baru
            INSERT INTO public.contacts (id, name, contact_person, email, phone, address, category, type, status, created_at, updated_at)
            VALUES (c.id, c.name, c.contact_person, c.email, c.phone, c.address, c.category, 'customer', c.status, c.created_at, c.updated_at);
        END IF;
    END LOOP;
END $$;

-- Tambahkan indeks untuk mempercepat pencarian berdasarkan type
CREATE INDEX IF NOT EXISTS contacts_type_idx ON public.contacts (type);

-- Backup tabel lama (opsional, hapus jika tidak diperlukan)
-- ALTER TABLE public.vendors RENAME TO vendors_backup;
-- ALTER TABLE public.customers RENAME TO customers_backup;

-- Hapus tabel lama (opsional, uncomment jika ingin menghapus tabel lama)
-- DROP TABLE public.vendors;
-- DROP TABLE public.customers;
