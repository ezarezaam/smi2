-- Buat tabel m_division (master divisi)
CREATE TABLE IF NOT EXISTS m_division (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Buat tabel m_jabatan (master jabatan)
CREATE TABLE IF NOT EXISTS m_jabatan (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Buat tabel employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  position TEXT,
  division TEXT,
  role_level INT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration INT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel expenses (pengeluaran)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  description TEXT,
  amount NUMERIC NOT NULL,
  category TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel sales_orders
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  order_date DATE NOT NULL,
  delivery_date DATE,
  payment_status TEXT DEFAULT 'unpaid',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel sales_order_items
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  service_id UUID REFERENCES services(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Buat tabel inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  location TEXT,
  last_restock_date DATE,
  min_stock_level INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel commercial_proposals
CREATE TABLE IF NOT EXISTS commercial_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  created_by UUID REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data awal untuk employees
INSERT INTO employees (name, email, position, division, role_level)
VALUES
  ('John Doe', 'john.doe@example.com', 'Manager', 'Sales', 1),
  ('Jane Smith', 'jane.smith@example.com', 'Staff', 'Finance', 3),
  ('Robert Johnson', 'robert.johnson@example.com', 'Supervisor', 'Operations', 2)
ON CONFLICT (email) DO NOTHING;

-- Data awal untuk products
INSERT INTO products (name, description, price, stock, category)
VALUES
  ('Laptop Asus', 'Laptop Asus ROG 15 inch', 15000000, 10, 'Electronics'),
  ('Smartphone Samsung', 'Samsung Galaxy S21', 12000000, 15, 'Electronics'),
  ('Office Chair', 'Ergonomic Office Chair', 2000000, 20, 'Furniture')
ON CONFLICT (name) DO NOTHING;

-- Data awal untuk services
INSERT INTO services (name, description, price, duration, category)
VALUES
  ('Website Development', 'Pembuatan website custom', 10000000, 30, 'IT Services'),
  ('Digital Marketing', 'Layanan pemasaran digital', 5000000, 30, 'Marketing'),
  ('Accounting Service', 'Layanan pembukuan dan akuntansi', 3000000, 30, 'Finance')
ON CONFLICT (name) DO NOTHING;

-- Data awal untuk vendors
INSERT INTO vendors (name, contact_person, email, phone, category)
VALUES
  ('PT Supplier Utama', 'Budi Santoso', 'budi@supplierutama.com', '08123456789', 'Electronics'),
  ('CV Mitra Sejati', 'Dewi Lestari', 'dewi@mitrasejati.com', '08234567890', 'Office Supplies'),
  ('PT Logistik Cepat', 'Agus Widodo', 'agus@logistikcepat.com', '08345678901', 'Logistics')
ON CONFLICT (name) DO NOTHING;

-- Data awal untuk customers
INSERT INTO customers (name, contact_person, email, phone, category)
VALUES
  ('PT Maju Bersama', 'Hendra Wijaya', 'hendra@majubersama.com', '08123456780', 'Corporate'),
  ('CV Teknologi Mandiri', 'Siti Rahayu', 'siti@teknologimandiri.com', '08234567891', 'SME'),
  ('PT Retail Indonesia', 'Bambang Sutrisno', 'bambang@retailindonesia.com', '08345678902', 'Retail')
ON CONFLICT (name) DO NOTHING;
