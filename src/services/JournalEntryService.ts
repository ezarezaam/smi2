import { supabase } from '../lib/supabase';
import { JournalEntry, JournalItem } from '../models/JournalEntry';

export const JournalEntryService = {
  // Mendapatkan semua journal entry
  async getAll(): Promise<{ data: JournalEntry[] | null, error: any }> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        items:journal_items (
          id,
          coa_code,
          description,
          debit_amount,
          credit_amount,
          coa:coa_code (
            code,
            name
          )
        )
      `)
      .is('deleted_at', null)
      .order('entry_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan journal entry berdasarkan ID
  async getById(id: string): Promise<{ data: JournalEntry | null, error: any }> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        items:journal_items (
          id,
          coa_code,
          description,
          debit_amount,
          credit_amount,
          coa:coa_code (
            code,
            name
          )
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    return { data, error };
  },
  
  // Membuat journal entry manual
  async create(journalEntry: JournalEntry): Promise<{ data: JournalEntry | null, error: any }> {
    try {
      // Validate balanced entry
      if (journalEntry.total_debit !== journalEntry.total_credit) {
        return { data: null, error: 'Journal entry must be balanced' };
      }
      
      // Insert journal entry
      const { data: entryData, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: journalEntry.entry_number,
          entry_date: journalEntry.entry_date,
          description: journalEntry.description,
          reference_type: journalEntry.reference_type || 'manual',
          reference_id: journalEntry.reference_id,
          total_debit: journalEntry.total_debit,
          total_credit: journalEntry.total_credit,
          status: journalEntry.status || 'draft',
          notes: journalEntry.notes
        })
        .select()
        .single();
      
      if (entryError || !entryData) {
        return { data: null, error: entryError };
      }
      
      // Insert journal items
      if (journalEntry.items && journalEntry.items.length > 0) {
        const items = journalEntry.items.map(item => ({
          journal_entry_id: entryData.id,
          coa_code: item.coa_code,
          description: item.description,
          debit_amount: item.debit_amount,
          credit_amount: item.credit_amount
        }));
        
        const { error: itemsError } = await supabase
          .from('journal_items')
          .insert(items);
        
        if (itemsError) {
          // Rollback journal entry if items failed
          await supabase
            .from('journal_entries')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', entryData.id);
          
          return { data: null, error: itemsError };
        }
      }
      
      return await this.getById(entryData.id);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Post journal entry
  async post(id: string, postedBy: string): Promise<{ data: JournalEntry | null, error: any }> {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        status: 'posted',
        posted_date: new Date().toISOString(),
        posted_by: postedBy
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Reverse journal entry
  async reverse(id: string, reason: string): Promise<{ data: JournalEntry | null, error: any }> {
    try {
      // Get original entry
      const { data: originalEntry, error: getError } = await this.getById(id);
      
      if (getError || !originalEntry) {
        return { data: null, error: getError || 'Journal entry not found' };
      }
      
      // Create reversal entry
      const reversalEntry: JournalEntry = {
        entry_number: this.generateEntryNumber('REV'),
        entry_date: new Date().toISOString(),
        description: `Reversal of ${originalEntry.entry_number}: ${reason}`,
        reference_type: originalEntry.reference_type,
        reference_id: originalEntry.reference_id,
        total_debit: originalEntry.total_credit, // Swap debit and credit
        total_credit: originalEntry.total_debit,
        status: 'posted',
        notes: `Reversal of journal entry ${originalEntry.entry_number}`,
        items: originalEntry.items?.map(item => ({
          coa_code: item.coa_code,
          description: `Reversal: ${item.description}`,
          debit_amount: item.credit_amount, // Swap debit and credit
          credit_amount: item.debit_amount
        }))
      };
      
      const { data: reversalData, error: reversalError } = await this.create(reversalEntry);
      
      if (reversalError) {
        return { data: null, error: reversalError };
      }
      
      // Update original entry status
      await supabase
        .from('journal_entries')
        .update({ status: 'reversed' })
        .eq('id', id);
      
      return { data: reversalData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Generate entry number
  generateEntryNumber(prefix: string = 'JE'): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${prefix}-${year}${month}${day}-${random}`;
  },
  
  // Soft delete journal entry
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('journal_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  }
};