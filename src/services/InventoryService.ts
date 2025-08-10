import { supabase } from '../lib/supabase';
import { Inventory } from '../models/Inventory';

export const InventoryService = {
  // Mendapatkan semua inventory
  async getAll(): Promise<{ data: Inventory[] | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product_id (
          id,
          name,
          description,
          price,
          category
        )
      `)
      .order('created_at');
    
    return { data, error };
  },
  
  // Mendapatkan inventory berdasarkan ID
  async getById(id: string): Promise<{ data: Inventory | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product_id (
          id,
          name,
          description,
          price,
          category
        )
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Mendapatkan inventory berdasarkan product_id
  async getByProductId(productId: string): Promise<{ data: Inventory | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product_id (
          id,
          name,
          description,
          price,
          category
        )
      `)
      .eq('product_id', productId)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan inventory baru
  async create(inventory: Inventory): Promise<{ data: Inventory | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventory)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate inventory
  async update(id: string, inventory: Partial<Inventory>): Promise<{ data: Inventory | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .update(inventory)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus inventory
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mengupdate stok produk
  async updateStock(productId: string, quantity: number): Promise<{ data: Inventory | null, error: any }> {
    // Cek apakah produk sudah ada di inventory
    const { data: existingInventory, error: checkError } = await this.getByProductId(productId);
    
    if (checkError) {
      return { data: null, error: checkError };
    }
    
    if (existingInventory) {
      // Update stok jika sudah ada
      const newQuantity = existingInventory.quantity + quantity;
      const { data, error } = await supabase
        .from('inventory')
        .update({
          quantity: newQuantity,
          last_restock_date: quantity > 0 ? new Date().toISOString() : existingInventory.last_restock_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInventory.id)
        .select()
        .single();
      
      return { data, error };
    } else {
      // Buat inventory baru jika belum ada
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          product_id: productId,
          quantity: quantity,
          last_restock_date: quantity > 0 ? new Date().toISOString() : null,
          min_stock_level: 10
        })
        .select()
        .single();
      
      return { data, error };
    }
  },
  
  // Mendapatkan produk dengan stok rendah
  async getLowStock(threshold?: number): Promise<{ data: Inventory[] | null, error: any }> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product_id (
          id,
          name,
          description,
          price,
          category
        )
      `)
      .lt('quantity', threshold || 10)
      .order('quantity');
    
    return { data, error };
  }
};
