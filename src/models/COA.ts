export interface COA {
  id?: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const sampleCOAs: COA[] = [
  {
    id: '1',
    code: '1000',
    name: 'Kas',
    category: 'Aset',
    subcategory: 'Aset Lancar',
    is_active: true,
  },
  {
    id: '2',
    code: '1100',
    name: 'Bank',
    category: 'Aset',
    subcategory: 'Aset Lancar',
    is_active: true,
  },
  {
    id: '3',
    code: '2000',
    name: 'Hutang Dagang',
    category: 'Kewajiban',
    subcategory: 'Kewajiban Lancar',
    is_active: true,
  },
  {
    id: '4',
    code: '3000',
    name: 'Modal',
    category: 'Ekuitas',
    subcategory: 'Modal Disetor',
    is_active: true,
  },
  {
    id: '5',
    code: '4000',
    name: 'Pendapatan Penjualan',
    category: 'Pendapatan',
    subcategory: 'Pendapatan Operasional',
    is_active: true,
  },
  {
    id: '6',
    code: '5000',
    name: 'Beban Gaji',
    category: 'Beban',
    subcategory: 'Beban Operasional',
    is_active: true,
  }
];

// Kategori COA
export const COACategories = [
  'Aset',
  'Kewajiban',
  'Ekuitas',
  'Pendapatan',
  'Beban'
];

// Subkategori COA berdasarkan kategori
export const COASubcategories: Record<string, string[]> = {
  'Aset': ['Aset Lancar', 'Aset Tetap', 'Aset Tidak Berwujud', 'Aset Lainnya'],
  'Kewajiban': ['Kewajiban Lancar', 'Kewajiban Jangka Panjang', 'Kewajiban Lainnya'],
  'Ekuitas': ['Modal Disetor', 'Laba Ditahan', 'Ekuitas Lainnya'],
  'Pendapatan': ['Pendapatan Operasional', 'Pendapatan Non-Operasional', 'Pendapatan Lainnya'],
  'Beban': ['Beban Operasional', 'Beban Non-Operasional', 'Beban Lainnya']
};
