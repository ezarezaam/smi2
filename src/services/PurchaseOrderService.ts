import { supabase } from '../supabaseClient';
import { PurchaseOrder } from '../models/PurchaseOrder';

export const PurchaseOrderService = {
  // Mendapatkan semua purchase order
  async getAll(): Promise<{ data: PurchaseOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        contact:contacts_id (
          id,
          name,
          contact_person,
          email,
          phone
        )
      `)
      .is('deleted_at', null)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan purchase order berdasarkan ID
  async getById(id: string): Promise<{ data: PurchaseOrder | null, error: any }> {
    try {
      console.log('PurchaseOrderService.getById called with ID:', id);
      
      // Ambil data purchase order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          contact:contacts_id (
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
      
      if (orderError) {
        console.error('Error fetching purchase order:', orderError);
        return { data: null, error: orderError };
      }
      
      if (!orderData) {
        console.error('Purchase order not found with ID:', id);
        return { data: null, error: 'Purchase order not found' };
      }
      
      console.log('Purchase order data from DB:', orderData);
      
      // Ambil data item purchase order
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price,
            stock,
            category
          ),
          uom:uom_id (
            id,
            name,
            code
          )
        `)
        .eq('purchase_order_id', id)
        .is('deleted_at', null);
      
      if (itemsError) {
        console.error('Error fetching purchase order items:', itemsError);
        return { data: orderData, error: itemsError };
      }
      
      console.log('Purchase order items from DB:', itemsData);
      console.log('Items count:', itemsData ? itemsData.length : 0);
      
      // Pemetaan data product untuk menambahkan buy_price dan sell_price
      const mappedItems = Array.isArray(itemsData) ? itemsData.map(item => {
        if (item.product) {
          // Tambahkan buy_price dan sell_price sebagai alias dari price
          return {
            ...item,
            product: {
              ...item.product,
              buy_price: item.product.price,
              sell_price: item.product.price
            }
          };
        }
        return item;
      }) : [];
      
      // Gabungkan data order dengan items
      const orderWithItems: PurchaseOrder = {
        ...orderData,
        items: mappedItems
      };
      
      console.log('Final purchase order with items:', orderWithItems);
      console.log('Final items count:', orderWithItems.items ? orderWithItems.items.length : 0);
      
      return { data: orderWithItems, error: null };
    } catch (error) {
      console.error('Unexpected error in getById:', error);
      return { data: null, error };
    }
  },
  
  // Menambahkan purchase order baru
  async create(purchaseOrder: PurchaseOrder): Promise<{ data: PurchaseOrder | null, error: any }> {
    // Mulai transaksi
    const { data: orderData, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        order_number: purchaseOrder.order_number || this.generateOrderNumber(),
        contacts_id: purchaseOrder.contacts_id,
        total_amount: purchaseOrder.total_amount,
        status: purchaseOrder.status || 'draft',
        order_date: purchaseOrder.order_date,
        expected_delivery_date: purchaseOrder.expected_delivery_date,
        received_date: purchaseOrder.received_date,
        payment_status: purchaseOrder.payment_status || 'unpaid',
        payment_method: purchaseOrder.payment_method,
        notes: purchaseOrder.notes,
        received_status: 'pending',
        billed_status: 'not_billed',
        paid_status: 'unpaid'
      })
      .select()
      .single();
    
    if (orderError || !orderData) {
      return { data: null, error: orderError };
    }
    
    // Jika ada items, tambahkan ke tabel purchase_order_items
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      const items = purchaseOrder.items.map(item => ({
        purchase_order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        uom_id: item.uom_id,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent || 0,
        tax_amount: item.tax_amount || 0,
        discount: item.discount || 0,
        total_price: item.total_price,
        received_quantity: 0,
        billed_quantity: 0
      }));
      
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(items);
      
      if (itemsError) {
        // Jika gagal menambahkan items, hapus purchase order
        await supabase
          .from('purchase_orders')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', orderData.id);
        
        return { data: null, error: itemsError };
      }
    }
    
    // Ambil data lengkap purchase order dengan items
    return await this.getById(orderData.id);
  },
  
  // Mengupdate purchase order
  async update(id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<{ data: PurchaseOrder | null, error: any }> {
    // Update data purchase order
    const { error: orderError } = await supabase
      .from('purchase_orders')
      .update({
        contacts_id: purchaseOrder.contacts_id,
        total_amount: purchaseOrder.total_amount,
        status: purchaseOrder.status,
        order_date: purchaseOrder.order_date,
        expected_delivery_date: purchaseOrder.expected_delivery_date,
        received_date: purchaseOrder.received_date,
        payment_status: purchaseOrder.payment_status,
        payment_method: purchaseOrder.payment_method,
        notes: purchaseOrder.notes
      })
      .eq('id', id)
      .is('deleted_at', null);
    
    if (orderError) {
      return { data: null, error: orderError };
    }
    
    // Update items jika ada
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      // Soft delete semua items lama
      const { error: deleteError } = await supabase
        .from('purchase_order_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('purchase_order_id', id)
        .is('deleted_at', null);
      
      if (deleteError) {
        return { data: null, error: deleteError };
      }
      
      // Tambahkan items baru
      const items = purchaseOrder.items.map(item => ({
        purchase_order_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        uom_id: item.uom_id,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent || 0,
        tax_amount: item.tax_amount || 0,
        discount: item.discount || 0,
        total_price: item.total_price,
        received_quantity: item.received_quantity || 0,
        billed_quantity: item.billed_quantity || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(items);
      
      if (itemsError) {
        return { data: null, error: itemsError };
      }
    }
    
    // Ambil data lengkap purchase order dengan items
    return await this.getById(id);
  },
  
  // Soft delete purchase order
  async delete(id: string): Promise<{ error: any }> {
    // Soft delete semua items terlebih dahulu
    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('purchase_order_id', id)
      .is('deleted_at', null);
    
    if (itemsError) {
      return { error: itemsError };
    }
    
    // Soft delete purchase order
    const { error } = await supabase
      .from('purchase_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Generate order number baru
  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `PO-${year}${month}${day}-${random}`;
  },
  
  // Update workflow status
  async updateWorkflowStatus(id: string, statusType: 'received' | 'billed' | 'paid', status: string): Promise<{ error: any }> {
    const updateField = `${statusType}_status`;
    const { error } = await supabase
      .from('purchase_orders')
      .update({ [updateField]: status })
      .eq('id', id)
      .is('deleted_at', null);
    
    return { error };
  }
};