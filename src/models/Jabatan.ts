export interface Jabatan {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const DEFAULT_JABATAN: Omit<Jabatan, 'id'> = {
  name: '',
  description: '',
  status: true,
};
