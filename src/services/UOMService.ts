import { supabase } from '../lib/supabase';
import { UOM } from '../models/UOM';

export const UOMService = {
  // Get all UOMs
  async getAll(): Promise<{ data: UOM[] | null; error: any }> {
    const { data, error } = await supabase
      .from('m_uom')
      .select('*')
      .order('name');

    return { data, error };
  },

  // Get UOM by ID
  async getById(id: number): Promise<{ data: UOM | null; error: any }> {
    const { data, error } = await supabase
      .from('m_uom')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Create new UOM
  async create(uom: Omit<UOM, 'id'>): Promise<{ data: UOM | null; error: any }> {
    const { data, error } = await supabase
      .from('m_uom')
      .insert(uom)
      .select()
      .single();

    return { data, error };
  },

  // Update UOM
  async update(
    id: string,
    updates: Partial<UOM>
  ): Promise<{ data: UOM | null; error: any }> {
    const { data, error } = await supabase
      .from('m_uom')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Delete UOM
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from('m_uom').delete().eq('id', id);
    return { error };
  },

  // Check if UOM code already exists
  async isCodeExists(code: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('m_uom')
      .select('id', { count: 'exact', head: true })
      .eq('code', code.toUpperCase());

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count } = await query;
    return (count || 0) > 0;
  },
};
