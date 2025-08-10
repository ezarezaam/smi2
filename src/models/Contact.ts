export interface Contact {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  type: number; // Tipe kontak: 1=customer, 2=vendor, 3=both
  status?: string;
  created_at?: string;
  updated_at?: string;
}
