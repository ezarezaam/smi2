import { Customer } from './Customer';
import { Employee } from './Employee';

export interface CommercialProposal {
  id?: string;
  proposal_number: string;
  customer_id?: string;
  customer?: Customer;
  title: string;
  description?: string;
  total_amount: number;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  valid_until?: string | Date;
  created_by?: string;
  creator?: Employee;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const PROPOSAL_STATUS = {
  draft: 'Draft',
  sent: 'Terkirim',
  accepted: 'Diterima',
  rejected: 'Ditolak'
};
