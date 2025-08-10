import { supabase } from '../lib/supabase';
import { CustomerPayment } from '../models/CustomerPayment';

export const CustomerPaymentService = {
  // Mendapatkan semua customer payment
  async getAll(): Promise<{ data: CustomerPayment[] | null, error: any }> {
    const { data, error } = await supabase
      .from('customer_payments')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        invoice:invoice_id (
          id,
          invoice_number,
          total_amount
        )
      `)
      .is('deleted_at', null)
      .order('payment_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan payment berdasarkan ID
  async getById(id: string): Promise<{ data: CustomerPayment | null, error: any }> {
    const { data, error } = await supabase
      .from('customer_payments')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        invoice:invoice_id (
          id,
          invoice_number,
          total_amount,
          paid_amount
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    return { data, error };
  },
  
  // Membuat payment baru
  async create(payment: CustomerPayment): Promise<{ data: CustomerPayment | null, error: any }> {
    try {
      // Insert payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('customer_payments')
        .insert({
          payment_number: payment.payment_number,
          customer_id: payment.customer_id,
          invoice_id: payment.invoice_id,
          payment_date: payment.payment_date,
          amount: payment.amount,
          payment_method: payment.payment_method,
          reference_number: payment.reference_number,
          notes: payment.notes,
          status: payment.status || 'completed'
        })
        .select()
        .single();
      
      if (paymentError || !paymentData) {
        return { data: null, error: paymentError };
      }
      
      // Update invoice paid amount if invoice_id is provided
      if (payment.invoice_id) {
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('paid_amount, total_amount')
          .eq('id', payment.invoice_id)
          .single();
        
        if (invoiceData) {
          const newPaidAmount = (invoiceData.paid_amount || 0) + payment.amount;
          const paymentStatus = newPaidAmount >= invoiceData.total_amount ? 'paid' : 'partial';
          
          await supabase
            .from('invoices')
            .update({
              paid_amount: newPaidAmount,
              payment_status: paymentStatus,
              status: paymentStatus === 'paid' ? 'paid' : invoiceData.status
            })
            .eq('id', payment.invoice_id);
        }
      }
      
      // Create journal entry if completed
      if (payment.status === 'completed') {
        await supabase.rpc('create_customer_payment_journal', {
          payment_id: paymentData.id,
          payment_date: payment.payment_date,
          amount: payment.amount,
          customer_name: payment.customer?.name || 'Unknown Customer',
          payment_method: payment.payment_method
        });
      }
      
      return await this.getById(paymentData.id);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Generate payment number
  generatePaymentNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `CP-${year}${month}${day}-${random}`;
  },
  
  // Soft delete payment
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('customer_payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Get outstanding invoices for a customer
  async getOutstandingInvoices(customerId: string): Promise<{ data: any[] | null, error: any }> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .neq('payment_status', 'paid')
      .eq('status', 'sent')
      .is('deleted_at', null)
      .order('due_date');
    
    return { data, error };
  }
};