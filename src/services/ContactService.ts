import { supabase } from '../supabaseClient';
import { Contact } from '../models/Contact';

export class ContactService {
  // Mendapatkan semua kontak
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return { data: null, error };
    }
  }

  // Mendapatkan kontak berdasarkan tipe (vendor, customer, both)
  static async getByType(type: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('type', type)
        .order('name');
      
      return { data, error };
    } catch (error) {
      console.error(`Error fetching contacts by type ${type}:`, error);
      return { data: null, error };
    }
  }

  // Mendapatkan kontak berdasarkan ID
  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching contact by ID:', error);
      return { data: null, error };
    }
  }

  // Menambahkan kontak baru
  static async create(contact: Partial<Contact>) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating contact:', error);
      return { data: null, error };
    }
  }

  // Mengupdate kontak
  static async update(id: string, contact: Partial<Contact>) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id)
        .select();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { data: null, error };
    }
  }

  // Menghapus kontak
  static async delete(id: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { data: null, error };
    }
  }

  // Mendapatkan kategori kontak yang tersedia
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Ekstrak kategori unik
      const categories = [...new Set(data.map(item => item.category))];
      return { data: categories, error: null };
    } catch (error) {
      console.error('Error fetching contact categories:', error);
      return { data: null, error };
    }
  }
}
