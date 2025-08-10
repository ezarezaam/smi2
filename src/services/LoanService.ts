import { supabase } from '../lib/supabase';
import { Loan, LoanPayment } from '../models/Loan';

export const LoanService = {
  // Mendapatkan semua loan
  async getAll(): Promise<{ data: Loan[] | null, error: any }> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        borrower:borrower_id (
          id,
          name,
          email
        )
      `)
      .is('deleted_at', null)
      .order('start_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan loan berdasarkan ID
  async getById(id: string): Promise<{ data: Loan | null, error: any }> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        borrower:borrower_id (
          id,
          name,
          email
        ),
        payments:loan_payments (
          id,
          payment_number,
          payment_date,
          amount,
          principal_amount,
          interest_amount,
          remaining_balance,
          status,
          notes
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan loan baru
  async create(loan: Loan): Promise<{ data: Loan | null, error: any }> {
    const { data, error } = await supabase
      .from('loans')
      .insert(loan)
      .select(`
        *,
        borrower:borrower_id (
          id,
          name,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Mengupdate loan
  async update(id: string, loan: Partial<Loan>): Promise<{ data: Loan | null, error: any }> {
    const { data, error } = await supabase
      .from('loans')
      .update(loan)
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        borrower:borrower_id (
          id,
          name,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Soft delete loan
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('loans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Generate loan number
  generateLoanNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `LOAN-${year}${month}${day}-${random}`;
  },
  
  // Record loan payment
  async recordPayment(loanId: string, payment: LoanPayment): Promise<{ data: LoanPayment | null, error: any }> {
    try {
      // Insert payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          payment_number: payment.payment_number,
          payment_date: payment.payment_date,
          amount: payment.amount,
          principal_amount: payment.principal_amount,
          interest_amount: payment.interest_amount,
          remaining_balance: payment.remaining_balance,
          status: payment.status || 'completed',
          notes: payment.notes
        })
        .select()
        .single();
      
      if (paymentError) {
        return { data: null, error: paymentError };
      }
      
      // Update loan remaining balance
      const { error: updateError } = await supabase
        .from('loans')
        .update({ remaining_balance: payment.remaining_balance })
        .eq('id', loanId);
      
      if (updateError) {
        return { data: paymentData, error: updateError };
      }
      
      // Check if loan is paid off
      if (payment.remaining_balance <= 0) {
        await supabase
          .from('loans')
          .update({ status: 'paid_off' })
          .eq('id', loanId);
      }
      
      return { data: paymentData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Get loan payments
  async getPayments(loanId: string): Promise<{ data: LoanPayment[] | null, error: any }> {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .is('deleted_at', null)
      .order('payment_date', { ascending: false });
    
    return { data, error };
  }
};