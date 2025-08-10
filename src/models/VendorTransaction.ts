export interface VendorTransaction {
  id: string;
  vendor_id: string;
  transaction_id: string;
  transaction_date: string;
  amount: number;
  description?: string;
  status: 'paid' | 'pending' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}
