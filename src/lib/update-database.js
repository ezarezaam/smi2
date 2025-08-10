import { supabase } from './supabase.js';

// Fungsi untuk mengubah struktur tabel sales_orders
const updateSalesOrdersTable = async () => {
  try {
    console.log('Memulai update struktur tabel sales_orders...');
    
    // 1. Periksa apakah tabel sales_orders ada
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('sales_orders')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.error('Error memeriksa tabel sales_orders:', tableCheckError);
      return { success: false, error: tableCheckError };
    }
    
    // 2. Coba tambahkan kolom contacts_id jika belum ada
    console.log('Mencoba menambahkan kolom contacts_id...');
    try {
      const { error: addColumnError } = await supabase.rpc('alter_table_add_column', {
        p_table: 'sales_orders',
        p_column: 'contacts_id',
        p_type: 'uuid references contacts(id)'
      });
      
      if (addColumnError) {
        console.log('Info: Kolom contacts_id mungkin sudah ada atau ada masalah lain:', addColumnError);
      } else {
        console.log('Kolom contacts_id berhasil ditambahkan');
      }
    } catch (error) {
      console.log('Info: Gagal menambahkan kolom contacts_id, mungkin sudah ada:', error);
    }
    
    // 3. Coba hapus kolom customer_id jika ada
    console.log('Mencoba menghapus kolom customer_id...');
    try {
      const { error: dropColumnError } = await supabase.rpc('alter_table_drop_column', {
        p_table: 'sales_orders',
        p_column: 'customer_id'
      });
      
      if (dropColumnError) {
        console.log('Info: Kolom customer_id mungkin tidak ada atau ada masalah lain:', dropColumnError);
      } else {
        console.log('Kolom customer_id berhasil dihapus');
      }
    } catch (error) {
      console.log('Info: Gagal menghapus kolom customer_id, mungkin sudah tidak ada:', error);
    }
    
    console.log('Update struktur tabel sales_orders selesai!');
    return { success: true };
  } catch (error) {
    console.error('Error saat update tabel sales_orders:', error);
    return { success: false, error };
  }
};

// Fungsi untuk membuat stored procedure yang dibutuhkan
const createHelperFunctions = async () => {
  try {
    console.log('Membuat helper functions...');
    
    // Buat fungsi untuk menambahkan kolom
    const { error: addColumnFnError } = await supabase.rpc('create_function_if_not_exists', {
      function_name: 'alter_table_add_column',
      function_definition: `
        CREATE OR REPLACE FUNCTION alter_table_add_column(p_table text, p_column text, p_type text)
        RETURNS void AS $$
        BEGIN
          BEGIN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s', p_table, p_column, p_type);
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error adding column: %', SQLERRM;
          END;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (addColumnFnError) {
      console.error('Error membuat fungsi alter_table_add_column:', addColumnFnError);
    }
    
    // Buat fungsi untuk menghapus kolom
    const { error: dropColumnFnError } = await supabase.rpc('create_function_if_not_exists', {
      function_name: 'alter_table_drop_column',
      function_definition: `
        CREATE OR REPLACE FUNCTION alter_table_drop_column(p_table text, p_column text)
        RETURNS void AS $$
        BEGIN
          BEGIN
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', p_table, p_column);
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error dropping column: %', SQLERRM;
          END;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (dropColumnFnError) {
      console.error('Error membuat fungsi alter_table_drop_column:', dropColumnFnError);
    }
    
    // Buat fungsi untuk membuat fungsi lain jika belum ada
    const { error: createFnError } = await supabase.rpc('create_function_if_not_exists', {
      function_name: 'create_function_if_not_exists',
      function_definition: `
        CREATE OR REPLACE FUNCTION create_function_if_not_exists(function_name text, function_definition text)
        RETURNS void AS $$
        BEGIN
          EXECUTE function_definition;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (createFnError) {
      console.error('Error membuat fungsi create_function_if_not_exists:', createFnError);
      return { success: false, error: createFnError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saat membuat helper functions:', error);
    return { success: false, error };
  }
};

// Fungsi utama untuk menjalankan update database
const updateDatabase = async () => {
  try {
    // 1. Buat helper functions
    const helperResult = await createHelperFunctions();
    if (!helperResult.success) {
      return helperResult;
    }
    
    // 2. Update tabel sales_orders
    return await updateSalesOrdersTable();
  } catch (error) {
    console.error('Error saat update database:', error);
    return { success: false, error };
  }
};

// Jalankan update database
updateDatabase()
  .then(result => {
    if (result.success) {
      console.log('Update database berhasil!');
    } else {
      console.error('Update database gagal:', result.error);
    }
  })
  .catch(error => {
    console.error('Error tidak terduga:', error);
  });

export { updateDatabase };
