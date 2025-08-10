export interface MasterOtherExpense {
  id?: number;
  code: string;
  category: string;
  category_id?: string; // legacy, jangan dipakai untuk simpan relasi
  expenses_category_id?: number | string; // relasi ke m_expenses_category.id
  name: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  coa_code: string;
  coa?: {
    code: string;
    name: string;
  };
}

// --- Tambahan field relasi kategori pengeluaran ---

export const EXPENSE_STATUS = {
  1: 'Aktif',
  0: 'Tidak Aktif'
};
