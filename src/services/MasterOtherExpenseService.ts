import { supabase } from '../supabaseClient';
import { MasterOtherExpense } from '../models/MasterOtherExpense';

export const MasterOtherExpenseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('m_other_expenses')
      .select(`
        *,
        coa:coa_code (
          code,
          name
        )
      `)
      .order('id', { ascending: true });
    
    return { data, error };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('m_other_expenses')
      .select(`
        *,
        coa:coa_code (
          code,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  async create(otherExpense: MasterOtherExpense) {
    // Pastikan kode dan kategori sudah terisi dengan benar
    if (!otherExpense.code || !otherExpense.category) {
      return { data: null, error: { message: 'Kode dan kategori harus diisi' } };
    }
    
    const { data, error } = await supabase
      .from('m_other_expenses')
      .insert([
        {
          code: otherExpense.code,
          category: otherExpense.category,
          name: otherExpense.name,
          expenses_category_id: otherExpense.expenses_category_id ? Number(otherExpense.expenses_category_id) : null,
          status: otherExpense.status || 1,
          coa_code: otherExpense.coa_code
        }
      ])
      .select();
    
    return { data, error };
  },

  async update(id: number, otherExpense: MasterOtherExpense) {
    const { data, error } = await supabase
      .from('m_other_expenses')
      .update({
        code: otherExpense.code,
        category: otherExpense.category,
        name: otherExpense.name,
        expenses_category_id: otherExpense.expenses_category_id ? Number(otherExpense.expenses_category_id) : null,
        status: otherExpense.status,
        coa_code: otherExpense.coa_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    return { data, error };
  },

  async delete(id: number) {
    const { data, error } = await supabase
      .from('m_other_expenses')
      .delete()
      .eq('id', id);
    
    return { data, error };
  },

  async getAllCoa() {
    const { data, error } = await supabase
      .from('coa')
      .select('code, name')
      .order('code', { ascending: true });
    
    return { data, error };
  },
  
  // Mendapatkan semua kategori pengeluaran dari tabel m_expenses_category
  async getAllExpenseCategories() {
    const { data, error } = await supabase
      .from('m_expenses_category')
      .select('id, code, name')
      .order('name', { ascending: true });
    
    return { data, error };
  },
  
  // Mendapatkan kategori pengeluaran berdasarkan ID
  async getExpenseCategoryById(id: number) {
    const { data, error } = await supabase
      .from('m_expenses_category')
      .select('id, code, name')
      .eq('id', id)
      .single();
    
    return { data, error };
  }
};

export default MasterOtherExpenseService;
