import { supabase } from '../lib/supabase';
import { VendorPayment } from '../models/VendorPayment';

export const VendorPaymentService = {
  // Mendapatkan semua vendor payment
  async getAll(): Promise<{ data: VendorPayment[] | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select(`
        *,
        vendor:vendor_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        bill:bill_id (
          id,
          bill_number,
          total_amount
        )
      `)
      .is('deleted_at', null)
      .order('payment_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan payment berdasarkan ID
  async getById(id: string): Promise<{ data: VendorPayment | null, error: any }> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select(`
        *,
        vendor:vendor_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        bill:bill_id (
          id,
          bill_number,
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
  async create(payment: VendorPayment): Promise<{ data: VendorPayment | null, error: any }> {
    try {
      // Insert payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('vendor_payments')
        .insert({
          payment_number: payment.payment_number,
          vendor_id: payment.vendor_id,
          bill_id: payment.bill_id,
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
      
      // Update bill paid amount if bill_id is provided
      if (payment.bill_id) {
        const { data: billData } = await supabase
          .from('bills')
          .select('paid_amount, total_amount')
          .eq('id', payment.bill_id)
          .single();
        
        if (billData) {
          const newPaidAmount = (billData.paid_amount || 0) + payment.amount;
          const paymentStatus = newPaidAmount >= billData.total_amount ? 'paid' : 'partial';
          
          await supabase
            .from('bills')
            .update({
              paid_amount: newPaidAmount,
              payment_status: paymentStatus,
              status: paymentStatus === 'paid' ? 'paid' : billData.status
            })
            .eq('id', payment.bill_id);
        }
      }
      
      // Create journal entry if completed
      if (payment.status === 'completed') {
        await supabase.rpc('create_vendor_payment_journal', {
          payment_id: paymentData.id,
          payment_date: payment.payment_date,
          amount: payment.amount,
          vendor_name: payment.vendor?.name || 'Unknown Vendor',
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
    
    return `VP-${year}${month}${day}-${random}`;
  },
  
  // Soft delete payment
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('vendor_payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Get outstanding bills for a vendor
  async getOutstandingBills(vendorId: string): Promise<{ data: any[] | null, error: any }> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('vendor_id', vendorId)
      .neq('payment_status', 'paid')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('due_date');
    
    return { data, error };
  }
};