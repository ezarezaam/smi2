import { supabase } from '../lib/supabase';
import { Division } from '../models/Division';

export const DivisionService = {
  // Ambil semua data divisi
  async getAll() {
    const { data, error } = await supabase
      .from('m_division')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Division[];
  },

  // Ambil data divisi by ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('m_division')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Division;
  },

  // Tambah data divisi baru
  async create(division: Omit<Division, 'id'>) {
    const { data, error } = await supabase
      .from('m_division')
      .insert([division])
      .select()
      .single();

    if (error) throw error;
    return data as Division;
  },

  // Update data divisi
  async update(id: number, updates: Partial<Division>) {
    const { data, error } = await supabase
      .from('m_division')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Division;
  },

  // Hapus data divisi
  async delete(id: number) {
    const { error } = await supabase
      .from('m_division')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Ambil data divisi yang aktif saja
  async getActive() {
    const { data, error } = await supabase
      .from('m_division')
      .select('*')
      .eq('status', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Division[];
  }
};
