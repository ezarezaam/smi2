import { supabase } from '../lib/supabase';
import { Jabatan } from '../models/Jabatan';

export const JabatanService = {
  // Ambil semua data jabatan
  async getAll() {
    const { data, error } = await supabase
      .from('m_jabatan')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Jabatan[];
  },

  // Ambil data jabatan by ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('m_jabatan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Jabatan;
  },

  // Tambah data jabatan baru
  async create(jabatan: Omit<Jabatan, 'id'>) {
    const { data, error } = await supabase
      .from('m_jabatan')
      .insert([jabatan])
      .select()
      .single();

    if (error) throw error;
    return data as Jabatan;
  },

  // Update data jabatan
  async update(id: number, updates: Partial<Jabatan>) {
    const { data, error } = await supabase
      .from('m_jabatan')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Jabatan;
  },

  // Hapus data jabatan
  async delete(id: number) {
    const { error } = await supabase
      .from('m_jabatan')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Ambil data jabatan yang aktif saja
  async getActive() {
    const { data, error } = await supabase
      .from('m_jabatan')
      .select('*')
      .eq('status', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Jabatan[];
  }
};
