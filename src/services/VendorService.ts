import { supabase } from '../lib/supabase';
import { Vendor } from '../models/Vendor';

export const VendorService = {
  // Mendapatkan semua vendor
  async getAll(): Promise<{ data: Vendor[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan vendor berdasarkan ID
  async getById(id: string): Promise<{ data: Vendor | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan vendor baru
  async create(vendor: Vendor): Promise<{ data: Vendor | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate vendor
  async update(id: string, vendor: Partial<Vendor>): Promise<{ data: Vendor | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendor)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus vendor
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari vendor berdasarkan nama atau kontak
  async search(query: string): Promise<{ data: Vendor[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan vendor berdasarkan kategori
  async getByCategory(category: string): Promise<{ data: Vendor[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan vendor berdasarkan status
  async getByStatus(status: 'active' | 'inactive'): Promise<{ data: Vendor[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', status)
      .order('name');
    
    return { data, error };
  }
};
