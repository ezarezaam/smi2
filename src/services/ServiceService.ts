import { supabase } from '../lib/supabase';
import { Product } from '../models/Product';

// Service adalah Product dengan group='Service'
export type Service = Omit<Product, 'stock'> & { features?: string[] };

export const ServiceService = {
  // Mendapatkan semua service (product dengan group='Service')
  async getAll(): Promise<{ data: Service[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('group', 'Service')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan service berdasarkan ID
  async getById(id: string): Promise<{ data: Service | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('group', 'Service')
      .single();
    
    return { data, error };
  },
  
  // Menambahkan service baru
  async create(service: Service): Promise<{ data: Service | null, error: any }> {
    // Pastikan group adalah 'Service' dan stock default 0 untuk service
    const serviceProduct = {
      ...service,
      group: 'Service',
      stock: 0
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(serviceProduct)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate service
  async update(id: string, service: Partial<Service>): Promise<{ data: Service | null, error: any }> {
    // Pastikan tidak mengubah group dari 'Service'
    const serviceUpdate = {
      ...service,
      group: 'Service'
    };
    
    const { data, error } = await supabase
      .from('products')
      .update(serviceUpdate)
      .eq('id', id)
      .eq('group', 'Service')
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus service
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('group', 'Service');
    
    return { error };
  },
  
  // Mencari service berdasarkan nama atau deskripsi
  async search(query: string): Promise<{ data: Service[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('group', 'Service')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan service berdasarkan kategori
  async getByCategory(category: string): Promise<{ data: Service[] | null, error: any }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('group', 'Service')
      .eq('category', category)
      .order('name');
    
    return { data, error };
  }
};
