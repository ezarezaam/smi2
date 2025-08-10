import { supabase } from './supabase';

// Fungsi untuk membuat tabel di Supabase
export const createTables = async () => {
  try {
    console.log('Memulai migrasi database Supabase...');
    
    // Buat tabel employees
    const { error: employeeError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'employees',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        email text unique not null,
        position text,
        division text,
        role_level int,
        phone text,
        address text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (employeeError) {
      console.error('Error membuat tabel employees:', employeeError);
    } else {
      console.log('Tabel employees berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel products
    const { error: productError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'products',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        description text,
        price numeric not null,
        stock int not null default 0,
        category text,
        image_url text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (productError) {
      console.error('Error membuat tabel products:', productError);
    } else {
      console.log('Tabel products berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel services
    const { error: serviceError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'services',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        description text,
        price numeric not null,
        duration int,
        category text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (serviceError) {
      console.error('Error membuat tabel services:', serviceError);
    } else {
      console.log('Tabel services berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel vendors
    const { error: vendorError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'vendors',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        contact_person text,
        email text,
        phone text,
        address text,
        category text,
        status text default 'active',
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (vendorError) {
      console.error('Error membuat tabel vendors:', vendorError);
    } else {
      console.log('Tabel vendors berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel customers
    const { error: customerError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'customers',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        contact_person text,
        email text,
        phone text,
        address text,
        category text,
        status text default 'active',
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (customerError) {
      console.error('Error membuat tabel customers:', customerError);
    } else {
      console.log('Tabel customers berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel expenses (pengeluaran)
    const { error: expenseError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'expenses',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        transaction_id text unique not null,
        vendor_id uuid references vendors(id),
        description text,
        amount numeric not null,
        category text,
        payment_method text,
        status text default 'pending',
        transaction_date date not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (expenseError) {
      console.error('Error membuat tabel expenses:', expenseError);
    } else {
      console.log('Tabel expenses berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel sales_orders
    const { error: salesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'sales_orders',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        order_number text unique not null,
        customer_id uuid references customers(id),
        total_amount numeric not null default 0,
        status text default 'draft',
        order_date date not null,
        delivery_date date,
        payment_status text default 'unpaid',
        payment_method text,
        notes text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (salesError) {
      console.error('Error membuat tabel sales_orders:', salesError);
    } else {
      console.log('Tabel sales_orders berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel sales_order_items
    const { error: salesItemError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'sales_order_items',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        sales_order_id uuid references sales_orders(id) on delete cascade,
        product_id uuid references products(id),
        service_id uuid references services(id),
        quantity int not null default 1,
        unit_price numeric not null,
        discount numeric default 0,
        total_price numeric not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        check (
          (product_id is not null and service_id is null) or
          (product_id is null and service_id is not null)
        )
      `
    });
    
    if (salesItemError) {
      console.error('Error membuat tabel sales_order_items:', salesItemError);
    } else {
      console.log('Tabel sales_order_items berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel inventory
    const { error: inventoryError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'inventory',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        product_id uuid references products(id) on delete cascade,
        quantity int not null default 0,
        location text,
        last_restock_date date,
        min_stock_level int default 10,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (inventoryError) {
      console.error('Error membuat tabel inventory:', inventoryError);
    } else {
      console.log('Tabel inventory berhasil dibuat atau sudah ada');
    }
    
    // Buat tabel commercial_proposals
    const { error: proposalError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'commercial_proposals',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        proposal_number text unique not null,
        customer_id uuid references customers(id),
        title text not null,
        description text,
        total_amount numeric not null default 0,
        status text default 'draft',
        valid_until date,
        created_by uuid references employees(id),
        notes text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });
    
    if (proposalError) {
      console.error('Error membuat tabel commercial_proposals:', proposalError);
    } else {
      console.log('Tabel commercial_proposals berhasil dibuat atau sudah ada');
    }
    
    console.log('Migrasi database Supabase selesai');
    return { success: true };
  } catch (error) {
    console.error('Error saat migrasi database:', error);
    return { success: false, error };
  }
};

// Fungsi untuk menambahkan data awal (seed)
export const seedInitialData = async () => {
  try {
    console.log('Menambahkan data awal...');
    
    // Tambahkan beberapa employee
    const { error: employeeError } = await supabase.from('employees').upsert([
      { 
        name: 'John Doe', 
        email: 'john.doe@example.com', 
        position: 'Manager', 
        division: 'Sales', 
        role_level: 1 
      },
      { 
        name: 'Jane Smith', 
        email: 'jane.smith@example.com', 
        position: 'Staff', 
        division: 'Finance', 
        role_level: 3 
      },
      { 
        name: 'Robert Johnson', 
        email: 'robert.johnson@example.com', 
        position: 'Supervisor', 
        division: 'Operations', 
        role_level: 2 
      }
    ], { onConflict: 'email' });
    
    if (employeeError) {
      console.error('Error menambahkan data employee:', employeeError);
    } else {
      console.log('Data employee berhasil ditambahkan');
    }
    
    // Tambahkan beberapa product
    const { error: productError } = await supabase.from('products').upsert([
      { 
        name: 'Laptop Asus', 
        description: 'Laptop Asus ROG 15 inch', 
        price: 15000000, 
        stock: 10, 
        category: 'Electronics' 
      },
      { 
        name: 'Smartphone Samsung', 
        description: 'Samsung Galaxy S21', 
        price: 12000000, 
        stock: 15, 
        category: 'Electronics' 
      },
      { 
        name: 'Office Chair', 
        description: 'Ergonomic Office Chair', 
        price: 2000000, 
        stock: 20, 
        category: 'Furniture' 
      }
    ], { onConflict: 'name' });
    
    if (productError) {
      console.error('Error menambahkan data product:', productError);
    } else {
      console.log('Data product berhasil ditambahkan');
    }
    
    // Tambahkan beberapa service
    const { error: serviceError } = await supabase.from('services').upsert([
      { 
        name: 'Website Development', 
        description: 'Pembuatan website custom', 
        price: 10000000, 
        duration: 30, 
        category: 'IT Services' 
      },
      { 
        name: 'Digital Marketing', 
        description: 'Layanan pemasaran digital', 
        price: 5000000, 
        duration: 30, 
        category: 'Marketing' 
      },
      { 
        name: 'Accounting Service', 
        description: 'Layanan pembukuan dan akuntansi', 
        price: 3000000, 
        duration: 30, 
        category: 'Finance' 
      }
    ], { onConflict: 'name' });
    
    if (serviceError) {
      console.error('Error menambahkan data service:', serviceError);
    } else {
      console.log('Data service berhasil ditambahkan');
    }
    
    // Tambahkan beberapa vendor
    const { error: vendorError } = await supabase.from('vendors').upsert([
      { 
        name: 'PT Supplier Utama', 
        contact_person: 'Budi Santoso', 
        email: 'budi@supplierutama.com', 
        phone: '08123456789', 
        category: 'Electronics' 
      },
      { 
        name: 'CV Mitra Sejati', 
        contact_person: 'Dewi Lestari', 
        email: 'dewi@mitrasejati.com', 
        phone: '08234567890', 
        category: 'Office Supplies' 
      },
      { 
        name: 'PT Logistik Cepat', 
        contact_person: 'Agus Widodo', 
        email: 'agus@logistikcepat.com', 
        phone: '08345678901', 
        category: 'Logistics' 
      }
    ], { onConflict: 'name' });
    
    if (vendorError) {
      console.error('Error menambahkan data vendor:', vendorError);
    } else {
      console.log('Data vendor berhasil ditambahkan');
    }
    
    // Tambahkan beberapa customer
    const { error: customerError } = await supabase.from('customers').upsert([
      { 
        name: 'PT Maju Bersama', 
        contact_person: 'Hendra Wijaya', 
        email: 'hendra@majubersama.com', 
        phone: '08123456780', 
        category: 'Corporate' 
      },
      { 
        name: 'CV Teknologi Mandiri', 
        contact_person: 'Siti Rahayu', 
        email: 'siti@teknologimandiri.com', 
        phone: '08234567891', 
        category: 'SME' 
      },
      { 
        name: 'PT Retail Indonesia', 
        contact_person: 'Bambang Sutrisno', 
        email: 'bambang@retailindonesia.com', 
        phone: '08345678902', 
        category: 'Retail' 
      }
    ], { onConflict: 'name' });
    
    if (customerError) {
      console.error('Error menambahkan data customer:', customerError);
    } else {
      console.log('Data customer berhasil ditambahkan');
    }
    
    console.log('Penambahan data awal selesai');
    return { success: true };
  } catch (error) {
    console.error('Error saat menambahkan data awal:', error);
    return { success: false, error };
  }
};

// Fungsi untuk menjalankan migrasi dan seed
export const initializeDatabase = async () => {
  // Buat stored procedure untuk membuat tabel jika belum ada
  const { error: rpcError } = await supabase.rpc('create_function_if_not_exists', {
    function_name: 'create_table_if_not_exists',
    function_definition: `
      CREATE OR REPLACE FUNCTION create_table_if_not_exists(table_name text, columns text)
      RETURNS void AS $$
      BEGIN
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I (%s)', table_name, columns);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  
  if (rpcError) {
    console.error('Error membuat stored procedure:', rpcError);
    return { success: false, error: rpcError };
  }
  
  // Jalankan migrasi untuk membuat tabel
  const migrationResult = await createTables();
  if (!migrationResult.success) {
    return migrationResult;
  }
  
  // Tambahkan data awal
  return await seedInitialData();
};
