import { supabase } from '../lib/supabase';
import { VendorTransaction } from '../models/VendorTransaction';

export const VendorTransactionService = {
  // Get all transactions for a specific vendor
  async getByVendorId(vendorId: string): Promise<{ data: VendorTransaction[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Get transaction by ID
  async getById(id: string): Promise<{ data: VendorTransaction | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Create a new transaction
  async create(transaction: VendorTransaction): Promise<{ data: VendorTransaction | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .insert(transaction)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Update a transaction
  async update(id: string, transaction: Partial<VendorTransaction>): Promise<{ data: VendorTransaction | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Delete a transaction
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('vendor_transactions')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Get transactions by status
  async getByStatus(vendorId: string, status: 'paid' | 'pending' | 'cancelled'): Promise<{ data: VendorTransaction[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', status)
      .order('transaction_date', { ascending: false });
    
    return { data, error };
  }
};
