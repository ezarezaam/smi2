export interface Vendor {
  id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}
