import { supabase } from '../lib/supabase';
import { Employee, EmployeeFormData } from '../models/Employee';

export const EmployeeService = {
  // Mendapatkan semua employee dengan relasi division dan position
  async getAll(): Promise<{ data: Employee[] | null, error: any }> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        division:division_id (id, name, status),
        position:position_id (id, name, status)
      `)
      .order('name');
    
    // Transform data to match Employee interface
    const transformedData = data?.map(emp => ({
      ...emp,
      division_id: emp.division?.id,
      division_name: emp.division?.name,
      position_id: emp.position?.id,
      position_name: emp.position?.name
    }));
    
    return { 
      data: transformedData as unknown as Employee[], 
      error 
    };
  },
  
  // Mendapatkan employee berdasarkan ID dengan relasi
  async getById(id: string): Promise<{ data: Employee | null, error: any }> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        division:division_id (id, name, status),
        position:position_id (id, name, status)
      `)
      .eq('id', id)
      .single();
    
    // Transform data to match Employee interface
    const transformedData = data ? {
      ...data,
      division_id: data.division?.id,
      division_name: data.division?.name,
      position_id: data.position?.id,
      position_name: data.position?.name
    } : null;
    
    return { 
      data: transformedData as unknown as Employee, 
      error 
    };
  },
  
  // Mendapatkan employee berdasarkan email
  async getByEmail(email: string): Promise<{ data: Employee | null, error: any }> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();
    
    return { data, error };
  },
  
  // Menambahkan employee baru
  async create(employee: EmployeeFormData): Promise<{ data: Employee | null, error: any }> {
    // Prepare data for insert
    const employeeData = {
      name: employee.name,
      email: employee.email,
      position_id: employee.position_id || null,
      division_id: employee.division_id || null,
      role_level: employee.role_level,
      phone: employee.phone,
      address: employee.address,
      status: employee.status
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select(`
        *,
        division:division_id (id, name, status),
        position:position_id (id, name, status)
      `)
      .single();
    
    // Transform data to match Employee interface
    const transformedData = data ? {
      ...data,
      division_id: data.division?.id,
      division_name: data.division?.name,
      position_id: data.position?.id,
      position_name: data.position?.name
    } : null;
    
    return { 
      data: transformedData as unknown as Employee, 
      error 
    };
  },
  
  // Mengupdate employee
  async update(id: string, employee: Partial<EmployeeFormData>): Promise<{ data: Employee | null, error: any }> {
    // Prepare data for update
    const employeeData = {
      name: employee.name,
      email: employee.email,
      position_id: employee.position_id || null,
      division_id: employee.division_id || null,
      role_level: employee.role_level,
      phone: employee.phone,
      address: employee.address,
      status: employee.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select(`
        *,
        division:division_id (id, name, status),
        position:position_id (id, name, status)
      `)
      .single();
    
    // Transform data to match Employee interface
    const transformedData = data ? {
      ...data,
      division_id: data.division?.id,
      division_name: data.division?.name,
      position_id: data.position?.id,
      position_name: data.position?.name
    } : null;
    
    return { 
      data: transformedData as unknown as Employee, 
      error 
    };
  },
  
  // Menghapus employee
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Mencari employee berdasarkan nama atau email
  async search(query: string): Promise<{ data: Employee[] | null, error: any }> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name');
    
    return { data, error };
  }
};
