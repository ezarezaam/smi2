import { supabase } from '../lib/supabase';
import { Product, ProductTransaction } from '../models/Product';

export const ProductService = {
  // Mendapatkan semua product
  async getAll(): Promise<{ data: Product[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan product berdasarkan ID
  async getById(id: string): Promise<{ data: Product | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan product baru
  async create(product: Product): Promise<{ data: Product | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate product
  async update(id: string, product: Partial<Product>): Promise<{ data: Product | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus product
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari product berdasarkan nama atau deskripsi
  async search(query: string): Promise<{ data: Product[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan product berdasarkan kategori
  async getByCategory(category: string): Promise<{ data: Product[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan product dengan stok rendah
  async getLowStock(threshold: number = 10): Promise<{ data: Product[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', threshold)
      .order('stock');
    
    return { data, error };
  },

  // Mendapatkan history transaksi produk (pembelian dan penjualan)
  async getTransactionHistory(productId: string): Promise<{ data: ProductTransaction[] | null, error: any }> {
    const { data, error } = await supabase
      .from('product_transactions')
      .select('*')
      .eq('product_id', productId)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },

  // Mendapatkan rata-rata harga beli produk
  async getAverageBuyPrice(productId: string): Promise<{ data: number | null, error: any }> {
    const { data, error } = await supabase
      .rpc('get_average_buy_price', { product_id_param: productId });
    
    return { data, error };
  },

  // Mendapatkan rata-rata harga jual produk
  async getAverageSellPrice(productId: string): Promise<{ data: number | null, error: any }> {
    const { data, error } = await supabase
      .rpc('get_average_sell_price', { product_id_param: productId });
    
    return { data, error };
  }
};
