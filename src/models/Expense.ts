export interface Expense {
  id?: string;
  transaction_id: string;
  description: string;
  amount: number;
  category: string;
  category_id?: string;
  payment_status: string;
  status: string;
  transaction_date: string | Date;
  created_at?: string;
  updated_at?: string;
  expense_code?: string; // Kode dari kategori pengeluaran
  coa_code?: string; // Kode COA terkait
}

export const EXPENSE_STATUS = {
  draft: 'Draft',
  in_process: 'Dalam Proses',
  approved: 'Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const PAYMENT_STATUS = {
  unpaid: 'Belum Bayar',
  partial: 'Sebagian',
  paid: 'Lunas'
};

export const PAYMENT_METHODS = {
  cash: 'Tunai',
  transfer: 'Transfer Bank',
  credit_card: 'Kartu Kredit',
  debit_card: 'Kartu Debit',
  check: 'Cek',
  other: 'Lainnya'
};

// Fungsi untuk generate ID transaksi
export const generateTransactionId = (code: string): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${code}-${year}${month}${day}-${random}`;
};
