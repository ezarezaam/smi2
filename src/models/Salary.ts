export interface Salary {
  id?: string;
  employee_id: string;
  employee?: {
    id: string;
    name: string;
    position?: string;
    division?: string;
    email: string;
  };
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
  deleted_at?: string;
}

export const SALARY_STATUS = {
  draft: 'Draft',
  approved: 'Disetujui',
  paid: 'Dibayar'
};

export const DEFAULT_SALARY: Omit<Salary, 'id'> = {
  employee_id: '',
  period_month: new Date().getMonth() + 1,
  period_year: new Date().getFullYear(),
  basic_salary: 0,
  allowances: 0,
  deductions: 0,
  overtime_hours: 0,
  overtime_rate: 0,
  overtime_pay: 0,
  gross_salary: 0,
  tax_deduction: 0,
  net_salary: 0,
  status: 'draft',
  notes: ''
};