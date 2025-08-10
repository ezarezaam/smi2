import { supabase } from '../lib/supabase';
import { Contact } from '../models/Contact';

export const CustomerService = {
  // Mendapatkan semua customer
  async getAll(): Promise<{ data: Contact[] | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or('type.eq.1,type.eq.3')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan customer berdasarkan ID
  async getById(id: string): Promise<{ data: Contact | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .or('type.eq.1,type.eq.3')
      .single();
    
    return { data, error };
  },
  
  // Menambahkan customer baru
  async create(customer: Contact): Promise<{ data: Contact | null, error: any }> {
    // Pastikan tipe adalah customer (1)
    const customerWithType = { ...customer, type: 1 };
    
    const { data, error } = await supabase
      .from('contacts')
      .insert(customerWithType)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate customer
  async update(id: string, customer: Partial<Contact>): Promise<{ data: Contact | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus customer
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari customer berdasarkan nama atau kontak
  async search(query: string): Promise<{ data: Contact[] | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
      .or('type.eq.1,type.eq.3')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan customer berdasarkan kategori
  async getByCategory(category: string): Promise<{ data: Contact[] | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('category', category)
      .or('type.eq.1,type.eq.3')
      .order('name');
    
    return { data, error };
  },
  
  // Mendapatkan customer berdasarkan status
  async getByStatus(status: 'active' | 'inactive'): Promise<{ data: Contact[] | null, error: any }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('status', status)
      .or('type.eq.1,type.eq.3')
      .order('name');
    
    return { data, error };
  }
};
