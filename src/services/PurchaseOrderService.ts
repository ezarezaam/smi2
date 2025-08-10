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
        .eq('purchase_order_id', id);
      
      if (itemsError) {
        console.error('Error fetching purchase order items:', itemsError);
        return { data: orderData, error: itemsError };
      }
      
      console.log('Purchase order items from DB:', itemsData);
      console.log('Items count:', itemsData ? itemsData.length : 0);
      
      if (itemsData && itemsData.length > 0) {
        console.log('First item details:', JSON.stringify(itemsData[0], null, 2));
      } else {
        console.log('No items found for purchase order ID:', id);
      }
      
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
        notes: purchaseOrder.notes
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
        total_price: item.total_price
      }));
      
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(items);
      
      if (itemsError) {
        // Jika gagal menambahkan items, hapus purchase order
        await supabase
          .from('purchase_orders')
          .delete()
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
      .eq('id', id);
    
    if (orderError) {
      return { data: null, error: orderError };
    }
    
    // Update items jika ada
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      // Hapus semua items lama
      const { error: deleteError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);
      
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
        total_price: item.total_price
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
  
  // Menghapus purchase order
  async delete(id: string): Promise<{ error: any }> {
    // Hapus semua items terlebih dahulu
    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);
    
    if (itemsError) {
      return { error: itemsError };
    }
    
    // Hapus purchase order
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari purchase order berdasarkan order_number atau vendor
  async search(query: string): Promise<{ data: PurchaseOrder[] | null, error: any }> {
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
      .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter purchase order berdasarkan status
  async filterByStatus(statuses: string[]): Promise<{ data: PurchaseOrder[] | null, error: any }> {
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
      .in('status', statuses)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter purchase order berdasarkan status pembayaran
  async filterByPaymentStatus(statuses: string[]): Promise<{ data: PurchaseOrder[] | null, error: any }> {
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
      .in('payment_status', statuses)
      .order('order_date', { ascending: false });
    
    return { data, error };
  },
  
  // Filter purchase order berdasarkan rentang tanggal
  async filterByDateRange(startDate: string, endDate: string): Promise<{ data: PurchaseOrder[] | null, error: any }> {
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
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('order_date', { ascending: false });
    
    return { data, error };
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
  
  // Update status purchase order menjadi received
  async markAsReceived(id: string, receivedDate: string | Date): Promise<{ data: PurchaseOrder | null, error: any }> {
    const { error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'received',
        received_date: receivedDate
      })
      .eq('id', id);
    
    if (error) {
      return { data: null, error };
    }
    
    // Ambil data purchase order untuk update stok produk
    const { data: orderData } = await this.getById(id);
    
    if (orderData && orderData.items && orderData.items.length > 0) {
      // Update stok produk
      for (const item of orderData.items) {
        if (item.product_id) {
          // Ambil data produk
          const { data: productData } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          
          if (productData) {
            // Update stok produk
            await supabase
              .from('products')
              .update({
                stock: productData.stock + item.quantity
              })
              .eq('id', item.product_id);
            
            // Tambahkan transaksi produk
            await supabase
              .from('product_transactions')
              .insert({
                product_id: item.product_id,
                transaction_type: 'purchase',
                quantity: item.quantity,
                price: item.unit_price,
                total_amount: item.total_price,
                transaction_date: receivedDate,
                reference_id: id,
                reference_name: orderData.contact?.name || 'Unknown Vendor'
              });
          }
        }
      }
    }
    
    return await this.getById(id);
  }
};
