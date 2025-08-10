import { supabase } from '../lib/supabase';
import { DeliveryOrder, DeliveryOrderItem } from '../models/DeliveryOrder';

export const DeliveryOrderService = {
  // Mendapatkan semua delivery order
  async getAll(): Promise<{ data: DeliveryOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('delivery_orders')
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
      .order('delivery_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan delivery order berdasarkan ID dengan items
  async getById(id: string): Promise<{ data: DeliveryOrder | null, error: any }> {
    try {
      // Ambil data delivery order
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('delivery_orders')
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
      
      if (deliveryError || !deliveryData) {
        return { data: null, error: deliveryError };
      }
      
      // Ambil data items
      const { data: itemsData, error: itemsError } = await supabase
        .from('delivery_order_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price
          )
        `)
        .eq('delivery_order_id', id)
        .is('deleted_at', null);
      
      if (itemsError) {
        return { data: deliveryData, error: itemsError };
      }
      
      return { 
        data: { ...deliveryData, items: itemsData || [] }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Membuat delivery order dari sales order
  async createFromSalesOrder(salesOrderId: string, deliveryData: Partial<DeliveryOrder>): Promise<{ data: DeliveryOrder | null, error: any }> {
    try {
      // Get sales order data dengan stock check
      const { data: soData, error: soError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          items:sales_order_items (
            id,
            product_id,
            quantity,
            delivered_quantity,
            unit_price,
            total_price,
            product:product_id (
              id,
              name,
              stock
            )
          )
        `)
        .eq('id', salesOrderId)
        .single();
      
      if (soError || !soData) {
        return { data: null, error: soError || 'Sales order not found' };
      }
      
      // Check stock availability untuk setiap item
      const itemsToDeliver = [];
      const itemsToBackorder = [];
      
      for (const item of soData.items || []) {
        const remainingToDeliver = item.quantity - (item.delivered_quantity || 0);
        const availableStock = item.product?.stock || 0;
        
        if (availableStock >= remainingToDeliver) {
          // Stock cukup, bisa deliver semua
          itemsToDeliver.push({
            ...item,
            delivered_quantity: remainingToDeliver
          });
        } else if (availableStock > 0) {
          // Stock sebagian, deliver yang ada, sisanya backorder
          itemsToDeliver.push({
            ...item,
            delivered_quantity: availableStock
          });
          itemsToBackorder.push({
            ...item,
            backordered_quantity: remainingToDeliver - availableStock
          });
        } else {
          // Tidak ada stock, semua jadi backorder
          itemsToBackorder.push({
            ...item,
            backordered_quantity: remainingToDeliver
          });
        }
      }
      
      let deliveryOrderData = null;
      
      // Create delivery order jika ada items yang bisa dikirim
      if (itemsToDeliver.length > 0) {
        const { data: newDelivery, error: deliveryError } = await supabase
          .from('delivery_orders')
          .insert({
            delivery_number: deliveryData.delivery_number || this.generateDeliveryNumber(),
            sales_order_id: salesOrderId,
            customer_id: soData.contacts_id,
            delivery_date: deliveryData.delivery_date || new Date().toISOString(),
            delivery_address: deliveryData.delivery_address,
            driver_name: deliveryData.driver_name,
            vehicle_number: deliveryData.vehicle_number,
            total_delivered_amount: itemsToDeliver.reduce((sum, item) => 
              sum + (item.delivered_quantity * item.unit_price), 0),
            status: deliveryData.status || 'draft',
            notes: deliveryData.notes,
            delivered_by: deliveryData.delivered_by
          })
          .select()
          .single();
        
        if (deliveryError || !newDelivery) {
          return { data: null, error: deliveryError };
        }
        
        deliveryOrderData = newDelivery;
        
        // Create delivery order items
        const deliveryItems = itemsToDeliver.map(item => ({
          delivery_order_id: newDelivery.id,
          sales_order_item_id: item.id,
          product_id: item.product_id,
          ordered_quantity: item.quantity,
          delivered_quantity: item.delivered_quantity,
          unit_price: item.unit_price,
          total_amount: item.delivered_quantity * item.unit_price,
          condition_status: 'good' as const
        }));
        
        const { error: itemsError } = await supabase
          .from('delivery_order_items')
          .insert(deliveryItems);
        
        if (itemsError) {
          // Rollback delivery order if items failed
          await supabase
            .from('delivery_orders')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', newDelivery.id);
          
          return { data: null, error: itemsError };
        }
        
        // Update delivered quantities in sales_order_items
        for (const item of itemsToDeliver) {
          await supabase
            .from('sales_order_items')
            .update({
              delivered_quantity: (item.delivered_quantity || 0) + item.delivered_quantity
            })
            .eq('id', item.id);
        }
        
        // Update product stock
        for (const item of itemsToDeliver) {
          await supabase
            .from('products')
            .update({
              stock: (item.product?.stock || 0) - item.delivered_quantity
            })
            .eq('id', item.product_id);
        }
        
        // Update sales order delivery status
        await this.updateSalesOrderDeliveryStatus(salesOrderId);
      }
      
      // Create backorder jika ada items yang tidak bisa dikirim
      if (itemsToBackorder.length > 0) {
        await this.createBackorder(salesOrderId, itemsToBackorder);
      }
      
      return deliveryOrderData ? await this.getById(deliveryOrderData.id) : { data: null, error: 'No items to deliver' };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Create backorder
  async createBackorder(salesOrderId: string, items: any[]): Promise<void> {
    const { data: backorderData, error: backorderError } = await supabase
      .from('backorders')
      .insert({
        backorder_number: this.generateBackorderNumber(),
        sales_order_id: salesOrderId,
        customer_id: items[0]?.customer_id,
        backorder_date: new Date().toISOString(),
        total_backorder_amount: items.reduce((sum, item) => 
          sum + (item.backordered_quantity * item.unit_price), 0),
        status: 'pending'
      })
      .select()
      .single();
    
    if (!backorderError && backorderData) {
      const backorderItems = items.map(item => ({
        backorder_id: backorderData.id,
        sales_order_item_id: item.id,
        product_id: item.product_id,
        ordered_quantity: item.quantity,
        backordered_quantity: item.backordered_quantity,
        fulfilled_quantity: 0,
        unit_price: item.unit_price,
        total_amount: item.backordered_quantity * item.unit_price
      }));
      
      await supabase
        .from('backorder_items')
        .insert(backorderItems);
    }
  },
  
  // Update sales order delivery status
  async updateSalesOrderDeliveryStatus(salesOrderId: string): Promise<void> {
    // Get all items for this SO
    const { data: items } = await supabase
      .from('sales_order_items')
      .select('quantity, delivered_quantity')
      .eq('sales_order_id', salesOrderId)
      .is('deleted_at', null);
    
    if (!items || items.length === 0) return;
    
    // Calculate delivery status
    const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalDelivered = items.reduce((sum, item) => sum + (item.delivered_quantity || 0), 0);
    
    let deliveryStatus = 'pending';
    if (totalDelivered === 0) {
      deliveryStatus = 'pending';
    } else if (totalDelivered >= totalOrdered) {
      deliveryStatus = 'completed';
    } else {
      deliveryStatus = 'partial';
    }
    
    // Update sales order
    await supabase
      .from('sales_orders')
      .update({ delivery_status: deliveryStatus })
      .eq('id', salesOrderId);
  },
  
  // Generate delivery number
  generateDeliveryNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `DO-${year}${month}${day}-${random}`;
  },
  
  // Generate backorder number
  generateBackorderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `BO-${year}${month}${day}-${random}`;
  },
  
  // Soft delete delivery order
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('delivery_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  }
};