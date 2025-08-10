import { supabase } from '../supabaseClient';

// Interface untuk data divisi
export interface Division {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// Interface untuk data jabatan
export interface Position {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export const MasterDataService = {
  // Mendapatkan semua divisi yang aktif
  async getActiveDivisions(): Promise<{ data: Division[] | null, error: any }> {
    const { data, error } = await supabase
      .from('m_division')
      .select('*')
      .eq('status', true)
      .order('name');
    
    return { data, error };
  },

  // Mendapatkan semua jabatan yang aktif
  async getActivePositions(): Promise<{ data: Position[] | null, error: any }> {
    const { data, error } = await supabase
      .from('m_jabatan')
      .select('*')
      .eq('status', true)
      .order('name');
    
    return { data, error };
  },

  // Mendapatkan divisi berdasarkan ID
  async getDivisionById(id: number): Promise<{ data: Division | null, error: any }> {
    const { data, error } = await supabase
      .from('m_division')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  // Mendapatkan jabatan berdasarkan ID
  async getPositionById(id: number): Promise<{ data: Position | null, error: any }> {
    const { data, error } = await supabase
      .from('m_jabatan')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
};
