export interface Employee {
  id?: string;
  name: string;
  email: string;
  position_id?: number;
  position_name?: string;  // Denormalized for display purposes
  division_id?: number;
  division_name?: string;  // Denormalized for display purposes
  role_level: number;      // 1-4, where 1 is the highest
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'on-leave';
  created_at?: string;
  updated_at?: string;
}

export const ROLE_LEVELS: Record<number, string> = {
  1: 'Level 1 (Tertinggi)',
  2: 'Level 2',
  3: 'Level 3',
  4: 'Level 4 (Terendah)'
};

// Interface untuk form employee
export interface EmployeeFormData {
  id?: string;  // Optional for new employee, required for edit
  name: string;
  email: string;
  position_id: number | '';
  division_id: number | '';
  role_level: number;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'on-leave';
}

// Default values for new employee
export const DEFAULT_EMPLOYEE: EmployeeFormData = {
  name: '',
  email: '',
  position_id: '',
  division_id: '',
  role_level: 4, // Default to lowest level
  phone: '',
  address: '',
  status: 'active'
};
