import { supabase } from '../src/lib/supabase.js';

// Fungsi untuk mengubah struktur tabel sales_orders
const updateSalesOrdersTable = async () => {
  try {
    console.log('Memulai migrasi tabel sales_orders...');
    
    // 1. Tambahkan kolom contacts_id jika belum ada
    console.log('Menambahkan kolom contacts_id...');
    const { error: addColumnError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS contacts_id UUID REFERENCES contacts(id);'
    });
    
    if (addColumnError) {
      console.error('Error menambahkan kolom contacts_id:', addColumnError);
      return { success: false, error: addColumnError };
    }
    
    // 2. Hapus foreign key constraint customer_id jika ada
    console.log('Menghapus foreign key constraint customer_id...');
    const { error: dropConstraintError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE sales_orders DROP CONSTRAINT IF EXISTS sales_orders_customer_id_fkey;'
    });
    
    if (dropConstraintError) {
      console.error('Error menghapus constraint customer_id:', dropConstraintError);
      return { success: false, error: dropConstraintError };
    }
    
    // 3. Hapus kolom customer_id jika ada
    console.log('Menghapus kolom customer_id...');
    const { error: dropColumnError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE sales_orders DROP COLUMN IF EXISTS customer_id;'
    });
    
    if (dropColumnError) {
      console.error('Error menghapus kolom customer_id:', dropColumnError);
      return { success: false, error: dropColumnError };
    }
    
    console.log('Migrasi tabel sales_orders selesai!');
    return { success: true };
  } catch (error) {
    console.error('Error saat migrasi tabel sales_orders:', error);
    return { success: false, error };
  }
};

// Jalankan migrasi
updateSalesOrdersTable()
  .then(result => {
    if (result.success) {
      console.log('Migrasi berhasil!');
    } else {
      console.error('Migrasi gagal:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error tidak terduga:', error);
    process.exit(1);
  });
