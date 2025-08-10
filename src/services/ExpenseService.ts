import { supabase } from '../lib/supabase';
import { Expense, generateTransactionId } from '../models/Expense';

export const ExpenseService = {
  // Mendapatkan semua expense
  async getAll(): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan expense berdasarkan ID
  async getById(id: string): Promise<{ data: Expense | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan expense baru
  async create(expense: Expense): Promise<{ data: Expense | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate expense
  async update(id: string, expense: Partial<Expense>): Promise<{ data: Expense | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus expense
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari expense berdasarkan transaction_id atau deskripsi
  async search(query: string): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .or(`transaction_id.ilike.%${query}%,description.ilike.%${query}%`)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter expense berdasarkan kategori
  async filterByCategory(categories: string[]): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .in('category', categories)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter expense berdasarkan status
  async filterByStatus(statuses: string[]): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .in('status', statuses)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter expense berdasarkan metode pembayaran
  async filterByPaymentMethod(methods: string[]): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .in('payment_method', methods)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter expense berdasarkan rentang tanggal
  async filterByDateRange(startDate: string, endDate: string): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan total expense berdasarkan kategori
  async getTotalByCategory(): Promise<{ data: any[] | null, error: any }> {
    const { data, error } = await supabase
      .rpc('get_expense_total_by_category');
    
    return { data, error };
  },
  
  // Mendapatkan total expense berdasarkan bulan
  async getTotalByMonth(): Promise<{ data: any[] | null, error: any }> {
    const { data, error } = await supabase
      .rpc('get_expense_total_by_month');
    
    return { data, error };
  },
  
  // Generate transaction ID baru berdasarkan kode kategori
  generateTransactionId(code: string): string {
    return generateTransactionId(code);
  },
  
  // Filter expense berdasarkan status pembayaran
  async filterByPaymentStatus(statuses: string[]): Promise<{ data: Expense[] | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .in('payment_status', statuses)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mengubah status pembayaran expense
  async updatePaymentStatus(id: string, paymentStatus: string): Promise<{ data: Expense | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengubah status expense
  async updateStatus(id: string, status: string): Promise<{ data: Expense | null, error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }
};
