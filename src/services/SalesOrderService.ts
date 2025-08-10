import { supabase } from '../lib/supabase';
import { SalesOrder, SalesOrderItem } from '../models/SalesOrder';
import { Product } from '../models/Product';
// Service import removed as it's no longer needed

export const SalesOrderService = {
  // Mendapatkan semua sales order
  async getAll(): Promise<{ data: SalesOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('sales_orders')
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
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan sales order berdasarkan ID
  async getById(id: string): Promise<{ data: SalesOrder | null, error: any }> {
    try {
      console.log('SalesOrderService.getById called with ID:', id);
      
      // Ambil data sales order
      const { data: orderData, error: orderError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          contact:contacts_id (
            id,
            name,
            contact_person,
            email,
            phone,
            address
          )
        `)
        .eq('id', id)
        .single();
      
      if (orderError) {
        console.error('Error fetching sales order:', orderError);
        return { data: null, error: orderError };
      }
      
      if (!orderData) {
        console.error('Sales order not found with ID:', id);
        return { data: null, error: 'Sales order not found' };
      }
      
      console.log('Sales order data from DB:', orderData);
      
      // Ambil data item sales order
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_order_items')
        .select(`
          *,
          product:product_id (
            id,
            name,
            description,
            price,
            stock
          ),
          uom:uom_id (
            id,
            name,
            code
          )
        `)
        .eq('sales_order_id', id);
      
      if (itemsError) {
        console.error('Error fetching sales order items:', itemsError);
        return { data: orderData, error: itemsError };
      }
      
      console.log('Sales order items from DB:', itemsData);
      console.log('Items count:', itemsData ? itemsData.length : 0);
      
      // Pemetaan data product untuk menambahkan buy_price dan sell_price
      const mappedItems = Array.isArray(itemsData) ? itemsData.map((item) => {
        // Handle product items
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
      const orderWithItems: SalesOrder = {
        ...orderData,
        items: mappedItems
      };
      
      console.log('Final sales order with items:', orderWithItems);
      console.log('Final items count:', orderWithItems.items ? orderWithItems.items.length : 0);
      
      return { data: orderWithItems, error: null };
    } catch (error) {
      console.error('Unexpected error in getById:', error);
      return { data: null, error };
    }
  },
  
  // Menambahkan sales order baru
  async create(salesOrder: SalesOrder): Promise<{ data: SalesOrder | null, error: any }> {
    // Mulai transaksi
    const { data: orderData, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        order_number: salesOrder.order_number,
        contacts_id: salesOrder.contacts_id,
        total_amount: salesOrder.total_amount,
        status: salesOrder.status || 'draft',
        order_date: salesOrder.order_date,
        expected_delivery_date: salesOrder.expected_delivery_date,
        payment_status: salesOrder.payment_status || 'unpaid',
        payment_method: salesOrder.payment_method,
        notes: salesOrder.notes
      })
      .select()
      .single();
    
    if (orderError || !orderData) {
      return { data: null, error: orderError };
    }
    
    // Tambahkan items jika ada
    if (salesOrder.items && salesOrder.items.length > 0) {
      const items = salesOrder.items.map(item => {
        return {
          sales_order_id: orderData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          uom_id: item.uom_id,
          unit_price: item.unit_price,
          tax_percent: item.tax_percent || 0,
          tax_amount: item.tax_amount || 0,
          discount: item.discount || 0,
          total_price: item.total_price
        };
      });
      
      const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(items);
      
      if (itemsError) {
        console.error('Error inserting sales order items:', itemsError);
        // Jika gagal menambahkan items, hapus sales order
        await supabase
          .from('sales_orders')
          .delete()
          .eq('id', orderData.id);
        
        return { data: null, error: itemsError };
      }
    }
    
    // Ambil data lengkap sales order dengan items
    return await this.getById(orderData.id);
  },
  
  // Mengupdate sales order
  async update(id: string, salesOrder: Partial<SalesOrder>): Promise<{ data: SalesOrder | null, error: any }> {
    // Update data sales order
    const { error: orderError } = await supabase
      .from('sales_orders')
      .update({
        contacts_id: salesOrder.contacts_id,
        total_amount: salesOrder.total_amount,
        status: salesOrder.status,
        order_date: salesOrder.order_date,
        expected_delivery_date: salesOrder.expected_delivery_date,
        payment_status: salesOrder.payment_status,
        payment_method: salesOrder.payment_method,
        notes: salesOrder.notes
      })
      .eq('id', id);
    
    if (orderError) {
      return { data: null, error: orderError };
    }
    
    // Jika ada items, update items
    if (salesOrder.items && salesOrder.items.length > 0) {
      // Hapus semua items lama
      const { error: deleteError } = await supabase
        .from('sales_order_items')
        .delete()
        .eq('sales_order_id', id);
      
      if (deleteError) {
        return { data: null, error: deleteError };
      }
      
      // Tambahkan items baru
      const items = salesOrder.items.map(item => {
        // Determine if this is a service item
        const isService = item.is_service || false;
        
        return {
          sales_order_id: id,
          // If it's a service, use service_id, otherwise use product_id
          product_id: !isService ? item.product_id : null,
          service_id: isService ? item.service_id : null,
          is_service: isService,
          quantity: item.quantity,
          uom_id: item.uom_id,
          unit_price: item.unit_price,
          tax_percent: item.tax_percent || 0,
          tax_amount: item.tax_amount || 0,
          discount: item.discount || 0,
          total_price: item.total_price
        };
      });
      
      const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(items);
      
      if (itemsError) {
        return { data: null, error: itemsError };
      }
    }
    
    // Ambil data lengkap sales order dengan items
    return await this.getById(id);
  },
  
  // Menghapus sales order
  async delete(id: string): Promise<{ error: any }> {
    // Hapus semua items terlebih dahulu
    const { error: itemsError } = await supabase
      .from('sales_order_items')
      .delete()
      .eq('sales_order_id', id);
    
    if (itemsError) {
      return { error: itemsError };
    }
    
    // Hapus sales order
    const { error } = await supabase
      .from('sales_orders')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari sales order berdasarkan order_number atau customer
  async search(query: string): Promise<{ data: SalesOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('sales_orders')
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
      .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%,contact.name.ilike.%${query}%`)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter sales order berdasarkan status
  async filterByStatus(statuses: string[]): Promise<{ data: SalesOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('sales_orders')
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
      .in('status', statuses)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter sales order berdasarkan status pembayaran
  async filterByPaymentStatus(statuses: string[]): Promise<{ data: SalesOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('sales_orders')
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
      .in('payment_status', statuses)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter sales order berdasarkan rentang tanggal
  async filterByDateRange(startDate: string, endDate: string): Promise<{ data: SalesOrder[] | null, error: any }> {
    const { data, error } = await supabase
      .from('sales_orders')
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
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan total sales order berdasarkan bulan
  async getTotalByMonth(): Promise<{ data: any[] | null, error: any }> {
    const { data, error } = await supabase
      .rpc('get_sales_total_by_month');
    
    return { data, error };
  },
  
  // Generate order number baru
  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `SO-${year}${month}${day}-${random}`;
  }
};
