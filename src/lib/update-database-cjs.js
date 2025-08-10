const { createClient } = require('@supabase/supabase-js');

// Buat koneksi ke Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://vkrfwdxqnhpwxwvdwkjd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcmZ3ZHhxbmhwd3h3dmR3a2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2NTk1MTQsImV4cCI6MjAzMzIzNTUxNH0.Nh83ebqzv7yMpXOmPuTQMkTxOLM8KmcHmLCTU_FxTYg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fungsi untuk memeriksa dan memperbaiki tabel sales_orders
async function fixSalesOrdersTable() {
  try {
    console.log('Memeriksa dan memperbaiki tabel sales_orders...');
    
    // 1. Periksa apakah tabel sales_orders ada
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error saat mengakses tabel sales_orders:', error);
      return;
    }
    
    console.log('Tabel sales_orders berhasil diakses');
    
    // 2. Coba tambahkan kolom contacts_id jika belum ada
    try {
      const { error: alterError } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS contacts_id UUID REFERENCES contacts(id)'
      });
      
      if (alterError) {
        console.error('Error saat menambahkan kolom contacts_id:', alterError);
      } else {
        console.log('Kolom contacts_id berhasil ditambahkan atau sudah ada');
      }
    } catch (err) {
      console.error('Gagal menambahkan kolom contacts_id:', err);
    }
    
    // 3. Coba hapus kolom customer_id jika ada
    try {
      const { error: dropError } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE sales_orders DROP COLUMN IF EXISTS customer_id'
      });
      
      if (dropError) {
        console.error('Error saat menghapus kolom customer_id:', dropError);
      } else {
        console.log('Kolom customer_id berhasil dihapus atau tidak ada');
      }
    } catch (err) {
      console.error('Gagal menghapus kolom customer_id:', err);
    }
    
    console.log('Proses perbaikan tabel sales_orders selesai');
  } catch (error) {
    console.error('Error tidak terduga:', error);
  }
}

// Jalankan fungsi perbaikan
fixSalesOrdersTable()
  .then(() => {
    console.log('Proses selesai');
  })
  .catch(err => {
    console.error('Error:', err);
  });
