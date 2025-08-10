import { supabase } from '../supabaseClient';
import { COA } from '../models/COA';

const TABLE_NAME = 'coa';

export const COAService = {
  // Get all COAs
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('code', { ascending: true });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching COAs:', error);
      return { data: null, error };
    }
  },

  // Get COA by ID
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching COA:', error);
      return { data: null, error };
    }
  },

  // Create new COA
  async create(coa: Omit<COA, 'id'>) {
    try {
      // Pastikan id tidak disertakan untuk menghindari konflik dengan serial ID di database
      const { id, ...coaData } = coa as any;
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([coaData])
        .select();
      
      return { data: data?.[0] || null, error };
    } catch (error) {
      console.error('Error creating COA:', error);
      return { data: null, error };
    }
  },

  // Update COA
  async update(id: string, updates: Partial<COA>) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .select();
      
      return { data: data?.[0] || null, error };
    } catch (error) {
      console.error('Error updating COA:', error);
      return { data: null, error };
    }
  },

  // Delete COA
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error('Error deleting COA:', error);
      return { error };
    }
  },

  // Check if code exists
  async isCodeExists(code: string, excludeId?: string) {
    try {
      let query = supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('code', code);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false;
    }
  }
};
