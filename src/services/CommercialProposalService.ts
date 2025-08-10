import { supabase } from '../lib/supabase';
import { CommercialProposal } from '../models/CommercialProposal';

export const CommercialProposalService = {
  // Mendapatkan semua proposal
  async getAll(): Promise<{ data: CommercialProposal[] | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan proposal berdasarkan ID
  async getById(id: string): Promise<{ data: CommercialProposal | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan proposal baru
  async create(proposal: CommercialProposal): Promise<{ data: CommercialProposal | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .insert(proposal)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Mengupdate proposal
  async update(id: string, proposal: Partial<CommercialProposal>): Promise<{ data: CommercialProposal | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .update(proposal)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Menghapus proposal
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('commercial_proposals')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari proposal berdasarkan proposal_number atau title
  async search(query: string): Promise<{ data: CommercialProposal[] | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .or(`proposal_number.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Filter proposal berdasarkan status
  async filterByStatus(statuses: string[]): Promise<{ data: CommercialProposal[] | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .in('status', statuses)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Filter proposal berdasarkan customer
  async filterByCustomer(customerId: string): Promise<{ data: CommercialProposal[] | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Filter proposal berdasarkan rentang tanggal
  async filterByDateRange(startDate: string, endDate: string): Promise<{ data: CommercialProposal[] | null, error: any }> {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        creator:created_by (
          id,
          name,
          position,
          email
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Generate proposal number baru
  generateProposalNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `PROP-${year}${month}${day}-${random}`;
  }
};
