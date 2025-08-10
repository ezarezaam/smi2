import { supabase } from '../lib/supabase';
import { Bill, BillItem } from '../models/Bill';

export const BillService = {
  // Mendapatkan semua bill
  async getAll(): Promise<{ data: Bill[] | null, error: any }> {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        purchase_order:purchase_order_id (
          id,
          order_number,
          total_amount
        ),
        vendor:vendor_id (
          id,
          name,
          contact_person,
          email,
          phone
        )
      `)
      .is('deleted_at', null)
      .order('bill_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan bill berdasarkan ID dengan items
  async getById(id: string): Promise<{ data: Bill | null, error: any }> {
    try {
      // Ambil data bill
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .select(`
          *,
          purchase_order:purchase_order_id (
            id,
            order_number,
            total_amount
          ),
          vendor:vendor_id (
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
      
      if (billError || !billData) {
        return { data: null, error: billError };
      }
      
      // Ambil data items
      const { data: itemsData, error: itemsError } = await supabase
        .from('bill_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price
          )
        `)
        .eq('bill_id', id)
        .is('deleted_at', null);
      
      if (itemsError) {
        return { data: billData, error: itemsError };
      }
      
      return { 
        data: { ...billData, items: itemsData || [] }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Membuat bill baru dari purchase order
  async createFromPurchaseOrder(purchaseOrderId: string, billData: Partial<Bill>): Promise<{ data: Bill | null, error: any }> {
    try {
      // Get purchase order data
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          items:purchase_order_items (
            id,
            product_id,
            quantity,
            received_quantity,
            billed_quantity,
            unit_price,
            tax_percent,
            tax_amount,
            total_price
          )
        `)
        .eq('id', purchaseOrderId)
        .single();
      
      if (poError || !poData) {
        return { data: null, error: poError || 'Purchase order not found' };
      }
      
      // Create bill
      const { data: newBill, error: billError } = await supabase
        .from('bills')
        .insert({
          bill_number: billData.bill_number || this.generateBillNumber(),
          purchase_order_id: purchaseOrderId,
          vendor_id: poData.contacts_id,
          bill_date: billData.bill_date || new Date().toISOString(),
          due_date: billData.due_date,
          subtotal_amount: billData.subtotal_amount || 0,
          tax_amount: billData.tax_amount || 0,
          discount_amount: billData.discount_amount || 0,
          total_amount: billData.total_amount || 0,
          status: billData.status || 'draft',
          payment_terms: billData.payment_terms,
          notes: billData.notes
        })
        .select()
        .single();
      
      if (billError || !newBill) {
        return { data: null, error: billError };
      }
      
      // Create bill items from received items
      if (poData.items && poData.items.length > 0) {
        const billItems = poData.items
          .filter((item: any) => (item.received_quantity || 0) > (item.billed_quantity || 0))
          .map((item: any) => {
            const billableQuantity = (item.received_quantity || 0) - (item.billed_quantity || 0);
            const itemTotal = billableQuantity * item.unit_price;
            const taxAmount = itemTotal * (item.tax_percent || 0) / 100;
            
            return {
              bill_id: newBill.id,
              purchase_order_item_id: item.id,
              product_id: item.product_id,
              description: `Billing for received items`,
              quantity: billableQuantity,
              unit_price: item.unit_price,
              tax_percent: item.tax_percent || 0,
              tax_amount: taxAmount,
              discount_amount: 0,
              total_amount: itemTotal + taxAmount
            };
          });
        
        if (billItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('bill_items')
            .insert(billItems);
          
          if (itemsError) {
            // Rollback bill if items failed
            await supabase
              .from('bills')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', newBill.id);
            
            return { data: null, error: itemsError };
          }
          
          // Update billed quantities in purchase_order_items
          for (const item of billItems) {
            await supabase
              .from('purchase_order_items')
              .update({
                billed_quantity: supabase.rpc('increment_billed_quantity', {
                  item_id: item.purchase_order_item_id,
                  quantity: item.quantity
                })
              })
              .eq('id', item.purchase_order_item_id);
          }
        }
      }
      
      return await this.getById(newBill.id);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Generate bill number
  generateBillNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `BILL-${year}${month}${day}-${random}`;
  },
  
  // Update bill
  async update(id: string, bill: Partial<Bill>): Promise<{ data: Bill | null, error: any }> {
    const { data, error } = await supabase
      .from('bills')
      .update(bill)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Soft delete bill
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('bills')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Approve bill and create journal entry
  async approve(id: string): Promise<{ data: Bill | null, error: any }> {
    try {
      // Update bill status
      const { data: billData, error: updateError } = await supabase
        .from('bills')
        .update({ status: 'approved' })
        .eq('id', id)
        .select(`
          *,
          vendor:vendor_id (name)
        `)
        .single();
      
      if (updateError || !billData) {
        return { data: null, error: updateError };
      }
      
      // Create journal entry
      await supabase.rpc('create_bill_journal', {
        bill_id: id,
        bill_date: billData.bill_date,
        total_amount: billData.total_amount,
        vendor_name: billData.vendor?.name || 'Unknown Vendor'
      });
      
      return { data: billData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};