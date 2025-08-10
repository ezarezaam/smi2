import { supabase } from '../lib/supabase';
import { Invoice, InvoiceItem } from '../models/Invoice';

export const InvoiceService = {
  // Mendapatkan semua invoice
  async getAll(): Promise<{ data: Invoice[] | null, error: any }> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        sales_order:sales_order_id (
          id,
          order_number,
          total_amount
        ),
        customer:customer_id (
          id,
          name,
          contact_person,
          email,
          phone
        )
      `)
      .is('deleted_at', null)
      .order('invoice_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan invoice berdasarkan ID dengan items
  async getById(id: string): Promise<{ data: Invoice | null, error: any }> {
    try {
      // Ambil data invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          sales_order:sales_order_id (
            id,
            order_number,
            total_amount
          ),
          customer:customer_id (
            id,
            name,
            contact_person,
            email,
            phone
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (invoiceError || !invoiceData) {
        return { data: null, error: invoiceError };
      }
      
      // Ambil data items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price
          )
        `)
        .eq('invoice_id', id)
        .is('deleted_at', null);
      
      if (itemsError) {
        return { data: invoiceData, error: itemsError };
      }
      
      return { 
        data: { ...invoiceData, items: itemsData || [] }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Membuat invoice dari sales order
  async createFromSalesOrder(salesOrderId: string, invoiceData: Partial<Invoice>): Promise<{ data: Invoice | null, error: any }> {
    try {
      // Get sales order data
      const { data: soData, error: soError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          items:sales_order_items (
            id,
            product_id,
            quantity,
            delivered_quantity,
            invoiced_quantity,
            unit_price,
            tax_percent,
            tax_amount,
            total_price
          )
        `)
        .eq('id', salesOrderId)
        .single();
      
      if (soError || !soData) {
        return { data: null, error: soError || 'Sales order not found' };
      }
      
      // Create invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoice_number || this.generateInvoiceNumber(),
          sales_order_id: salesOrderId,
          customer_id: soData.contacts_id,
          invoice_date: invoiceData.invoice_date || new Date().toISOString(),
          due_date: invoiceData.due_date,
          subtotal_amount: invoiceData.subtotal_amount || 0,
          tax_amount: invoiceData.tax_amount || 0,
          discount_amount: invoiceData.discount_amount || 0,
          total_amount: invoiceData.total_amount || 0,
          status: invoiceData.status || 'draft',
          payment_terms: invoiceData.payment_terms,
          notes: invoiceData.notes
        })
        .select()
        .single();
      
      if (invoiceError || !newInvoice) {
        return { data: null, error: invoiceError };
      }
      
      // Create invoice items from delivered items
      if (soData.items && soData.items.length > 0) {
        const invoiceItems = soData.items
          .filter((item: any) => (item.delivered_quantity || 0) > (item.invoiced_quantity || 0))
          .map((item: any) => {
            const invoicableQuantity = (item.delivered_quantity || 0) - (item.invoiced_quantity || 0);
            const itemTotal = invoicableQuantity * item.unit_price;
            const taxAmount = itemTotal * (item.tax_percent || 0) / 100;
            
            return {
              invoice_id: newInvoice.id,
              sales_order_item_id: item.id,
              product_id: item.product_id,
              description: `Invoice for delivered items`,
              quantity: invoicableQuantity,
              unit_price: item.unit_price,
              tax_percent: item.tax_percent || 0,
              tax_amount: taxAmount,
              discount_amount: 0,
              total_amount: itemTotal + taxAmount
            };
          });
        
        if (invoiceItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems);
          
          if (itemsError) {
            // Rollback invoice if items failed
            await supabase
              .from('invoices')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', newInvoice.id);
            
            return { data: null, error: itemsError };
          }
          
          // Update invoiced quantities in sales_order_items
          for (const item of invoiceItems) {
            await supabase
              .from('sales_order_items')
              .update({
                invoiced_quantity: supabase.rpc('increment_invoiced_quantity', {
                  item_id: item.sales_order_item_id,
                  quantity: item.quantity
                })
              })
              .eq('id', item.sales_order_item_id);
          }
        }
      }
      
      return await this.getById(newInvoice.id);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Generate invoice number
  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `INV-${year}${month}${day}-${random}`;
  },
  
  // Update invoice
  async update(id: string, invoice: Partial<Invoice>): Promise<{ data: Invoice | null, error: any }> {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Soft delete invoice
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  }
};