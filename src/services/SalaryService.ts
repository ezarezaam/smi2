import { supabase } from '../lib/supabase';
import { Salary } from '../models/Salary';

export const SalaryService = {
  // Mendapatkan semua salary
  async getAll(): Promise<{ data: Salary[] | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .is('deleted_at', null)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan salary berdasarkan ID
  async getById(id: string): Promise<{ data: Salary | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan salary baru
  async create(salary: Salary): Promise<{ data: Salary | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .insert(salary)
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Mengupdate salary
  async update(id: string, salary: Partial<Salary>): Promise<{ data: Salary | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .update(salary)
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Soft delete salary
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('salaries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  },
  
  // Mendapatkan salary berdasarkan employee
  async getByEmployee(employeeId: string): Promise<{ data: Salary[] | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .eq('employee_id', employeeId)
      .is('deleted_at', null)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan salary berdasarkan periode
  async getByPeriod(month: number, year: number): Promise<{ data: Salary[] | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .eq('period_month', month)
      .eq('period_year', year)
      .is('deleted_at', null)
      .order('employee.name');
    
    return { data, error };
  },
  
  // Approve salary
  async approve(id: string): Promise<{ data: Salary | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .update({ status: 'approved' })
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Pay salary
  async pay(id: string): Promise<{ data: Salary | null, error: any }> {
    const { data, error } = await supabase
      .from('salaries')
      .update({ 
        status: 'paid',
        payment_date: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          position,
          division,
          email
        )
      `)
      .single();
    
    return { data, error };
  }
};