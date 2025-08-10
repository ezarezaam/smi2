import { Contact } from './Contact';
import { Product } from './Product';
import { SalesOrder } from './SalesOrder';

export interface DeliveryOrderItem {
  id?: string;
  delivery_order_id?: string;
  sales_order_item_id: string;
  product_id: string;
  product?: Product;
  ordered_quantity: number;
  delivered_quantity: number;
  unit_price: number;
  total_amount: number;
  condition_status: 'good' | 'damaged' | 'partial_damage';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DeliveryOrder {
  id?: string;
  delivery_number: string;
  sales_order_id: string;
  sales_order?: SalesOrder;
  customer_id: string;
  customer?: Contact;
  delivery_date: string | Date;
  delivery_address?: string;
  driver_name?: string;
  vehicle_number?: string;
  total_delivered_amount: number;
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  delivered_by?: string;
  received_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  items?: DeliveryOrderItem[];
}

export const DELIVERY_STATUS = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan'
};

export const CONDITION_STATUS = {
  good: 'Baik',
  damaged: 'Rusak',
  partial_damage: 'Sebagian Rusak'
};