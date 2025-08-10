import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, '../../migrations/add_uom_and_tax_to_purchase_order_items.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Running migration...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Migration failed:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
    console.log('Result:', data);
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

runMigration();
