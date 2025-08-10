export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string; // Stock Keeping Unit
  uom_name?: string; // Unit of Measure name from m_uom table
  category?: string; // Category name from m_product_category table
  group?: string; // Group name from m_product_group table
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  // Aliases for compatibility
  buy_price?: number; // Alias used in app
  sell_price?: number; // Alias used in app
  cost?: number; // Alias for buy_price
  status_aktif?: number; // 1 = aktif, 0 = tidak aktif
}

export interface ProductTransaction {
  id: string;
  product_id: string;
  transaction_type: 'purchase' | 'sale';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  reference_id: string; // ID transaksi pembelian atau penjualan
  reference_name: string; // Nama vendor atau customer
}
