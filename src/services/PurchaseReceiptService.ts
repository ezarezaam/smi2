import { supabase } from '../lib/supabase';
import { PurchaseReceipt, PurchaseReceiptItem } from '../models/PurchaseReceipt';

export const PurchaseReceiptService = {
  // Mendapatkan semua receipt
  async getAll(): Promise<{ data: PurchaseReceipt[] | null, error: any }> {
    const { data, error } = await supabase
      .from('purchase_receipts')
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
      .order('receipt_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan receipt berdasarkan ID dengan items
  async getById(id: string): Promise<{ data: PurchaseReceipt | null, error: any }> {
    try {
      // Ambil data receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from('purchase_receipts')
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
      
      if (receiptError || !receiptData) {
        return { data: null, error: receiptError };
      }
      
      // Ambil data items
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_receipt_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price
          )
        `)
        .eq('receipt_id', id)
        .is('deleted_at', null);
      
      if (itemsError) {
        return { data: receiptData, error: itemsError };
      }
      
      return { 
        data: { ...receiptData, items: itemsData || [] }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Membuat receipt baru
  async create(receipt: PurchaseReceipt): Promise<{ data: PurchaseReceipt | null, error: any }> {
    try {
      // Insert receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from('purchase_receipts')
        .insert({
          receipt_number: receipt.receipt_number,
          purchase_order_id: receipt.purchase_order_id,
          vendor_id: receipt.vendor_id,
          receipt_date: receipt.receipt_date,
          total_received_amount: receipt.total_received_amount,
          status: receipt.status || 'draft',
          notes: receipt.notes,
          received_by: receipt.received_by
        })
        .select()
        .single();
      
      if (receiptError || !receiptData) {
        return { data: null, error: receiptError };
      }
      
      // Insert items jika ada
      if (receipt.items && receipt.items.length > 0) {
        const items = receipt.items.map(item => ({
          receipt_id: receiptData.id,
          purchase_order_item_id: item.purchase_order_item_id,
          product_id: item.product_id,
          ordered_quantity: item.ordered_quantity,
          received_quantity: item.received_quantity,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
          condition_status: item.condition_status,
          notes: item.notes
        }));
        
        const { error: itemsError } = await supabase
          .from('purchase_receipt_items')
          .insert(items);
        
        if (itemsError) {
          // Rollback receipt if items failed
          await supabase
            .from('purchase_receipts')
            .delete()
            .eq('id', receiptData.id);
          
          return { data: null, error: itemsError };
        }
        
        // Update received quantities in purchase_order_items
        for (const item of receipt.items) {
          await supabase
            .from('purchase_order_items')
            .update({
              received_quantity: supabase.rpc('increment_received_quantity', {
                item_id: item.purchase_order_item_id,
                quantity: item.received_quantity
              })
            })
            .eq('id', item.purchase_order_item_id);
        }
        
        // Update purchase order received status
        await this.updatePurchaseOrderStatus(receipt.purchase_order_id);
      }
      
      // Create journal entry if confirmed
      if (receipt.status === 'confirmed') {
        await supabase.rpc('create_purchase_receipt_journal', {
          receipt_id: receiptData.id,
          receipt_date: receipt.receipt_date,
          total_amount: receipt.total_received_amount,
          vendor_name: receipt.vendor?.name || 'Unknown Vendor'
        });
      }
      
      return await this.getById(receiptData.id);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Update purchase order status based on received quantities
  async updatePurchaseOrderStatus(purchaseOrderId: string): Promise<void> {
    // Get all items for this PO
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('quantity, received_quantity')
      .eq('purchase_order_id', purchaseOrderId)
      .is('deleted_at', null);
    
    if (!items || items.length === 0) return;
    
    // Calculate received status
    const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = items.reduce((sum, item) => sum + (item.received_quantity || 0), 0);
    
    let receivedStatus = 'pending';
    if (totalReceived === 0) {
      receivedStatus = 'pending';
    } else if (totalReceived >= totalOrdered) {
      receivedStatus = 'completed';
    } else {
      receivedStatus = 'partial';
    }
    
    // Update purchase order
    await supabase
      .from('purchase_orders')
      .update({ received_status: receivedStatus })
      .eq('id', purchaseOrderId);
  },
  
  // Generate receipt number
  generateReceiptNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `RCP-${year}${month}${day}-${random}`;
  },
  
  // Soft delete receipt
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('purchase_receipts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  }
};