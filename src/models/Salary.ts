export interface Salary {
  id?: string;
  employee_id: string;
  employee?: any;
  period_month: number;
  period_year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  gross_salary: number;
  tax_deduction: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  payment_date?: string | Date;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const SALARY_STATUS = {
  draft: 'Draft',
  approved: 'Disetujui',
  paid: 'Dibayar'
};